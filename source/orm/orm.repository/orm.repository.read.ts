import { EntityManager, EntityName, FindOptions } from '@mikro-orm/core';
import { AutoPath, FilterQuery } from '@mikro-orm/core/typings';
import { BadRequestException, ConflictException, InternalServerErrorException, NotFoundException } from '@nestjs/common';
import crypto from 'crypto';

import { AppModule } from '../../app/app.module';
import { CacheService } from '../../cache/cache.service';
import { OrmPageDto } from '../orm.dto';
import { OrmException, OrmQueryOrder, OrmSpanPrefix } from '../orm.enum';
import { OrmReadOptions, OrmReadPaginatedParams, OrmReadParams, OrmRepositoryOptions } from '../orm.interface';
import { OrmBaseRepository } from './orm.repository.base';

export abstract class OrmReadRepository<Entity extends object> extends OrmBaseRepository<Entity> {

  public constructor(
    protected readonly entityManager: EntityManager,
    protected readonly entityName: EntityName<Entity>,
    protected readonly repositoryOptions: OrmRepositoryOptions<Entity>,
  ) {
    super(entityManager, entityName, repositoryOptions);
  }

  /**
   * Populate chosen fields of target entities .
   * @param entities
   * @param populate
   */
  public populate<P extends string = never>(
    entities: Entity | Entity[],
    populate: AutoPath<Entity, P>[] | boolean,
  ): Promise<Entity[]> {
    return this.runWithinSpan(OrmSpanPrefix.POPULATE, async () => {
      return this.entityManager.populate(entities, populate);
    });
  }

  /**
   * Read entities matching given criteria, allowing pagination
   * and population options.
   * @param params
   * @param options
   */
  public async readBy<P extends string = never>(
    params: OrmReadParams<Entity>,
    options: OrmReadOptions<Entity, P> = { },
  ): Promise<Entity[]> {
    return this.runWithinSpan(OrmSpanPrefix.READ, async () => {
      if (!this.isValidData(params)) return [ ];

      options.populate ??= this.repositoryOptions.defaultPopulate as any ?? false;
      options.refresh ??= true;

      const readEntities = await this.entityManager.find(this.entityName, params, options as FindOptions<Entity, P>);

      if (!readEntities?.[0] && options.findOrFail) {
        throw new NotFoundException(OrmException.ENTITY_NOT_FOUND);
      }

      return readEntities || [ ];
    });
  }

  /**
   * Read a single entity by its ID.
   * @param id
   * @param options
   */
  public async readById<P extends string = never>(
    id: string | number,
    options: OrmReadOptions<Entity, P> = { },
  ): Promise<Entity> {
    const pks = this.getPrimaryKeys();

    if (pks.length > 1) {
      throw new InternalServerErrorException({
        message: `readById unsupported for ${this.entityName as string} as it has composite primary key`,
      });
    }

    const entities = await this.readBy({ [pks[0]]: id } as FilterQuery<Entity>, options);
    return entities[0];
  }

  /**
   * Reads a single entity by its ID, fails if inexistent.
   * @param id
   * @param options
   */
  public async readByIdOrFail<P extends string = never>(
    id: string | number,
    options: Omit<OrmReadOptions<Entity, P>, 'findOrFail'> = { },
  ): Promise<Entity> {
    return this.readById(id, { ...options, findOrFail: true });
  }

  /**
   * Read a supposedly unique entity, throws an exception
   * if matching more than one.
   * @param params
   * @param options
   */
  public async readUnique<P extends string = never>(
    params: OrmReadParams<Entity>,
    options: OrmReadOptions<Entity, P> = { },
  ): Promise<Entity> {
    const entities = await this.readBy(params, options);

    if (entities.length > 1) {
      throw new ConflictException({
        message: OrmException.UNIQUE_KEY_FAIL,
        params,
        entities,
      });
    }

    return entities[0];
  }

  /**
   * Read a supposedly unique entity, throws an exception
   * if matching more than one or if not found.
   * @param params
   * @param options
   */
  public async readUniqueOrFail<P extends string = never>(
    params: OrmReadParams<Entity>,
    options: Omit<OrmReadOptions<Entity, P>, 'findOrFail'> = { },
  ): Promise<Entity> {
    return this.readUnique(params, { ...options, findOrFail: true });
  }

  /**
   * Count entities matching given criteria.
   * @param params
   */
  public countBy(params: OrmReadParams<Entity>): Promise<number> {
    return this.runWithinSpan(OrmSpanPrefix.COUNT, async () => {
      if (!this.isValidData(params)) return 0;
      return this.entityManager.count(this.entityName, params);
    });
  }

  /**
   * Read entities with pagination support including sort, order,
   * limit, offset and whether to include total count or not.
   *
   * Also supports pagination tokens which caches contextual
   * pagination information in-memory or distributed according
   * to cache service configuration.
   * @param params
   */
  public async readPaginatedBy(params: OrmReadPaginatedParams<Entity>): Promise<OrmPageDto<Entity>> {
    const { token } = params;

    if (token && Object.keys(params).length > 1) {
      throw new BadRequestException('token is mutually exclusive with other pagination properties');
    }

    let page: OrmPageDto<Entity>;

    if (token) {
      const context = await this.readTokenContext(token);
      page = await this.readPageBy(context);
    }
    else {
      page = await this.readPageBy(params);
    }

    return page;
  }

  /**
   * Apply pagination coalesces and reads target page,
   * then build pagination tokens.
   * @param params
   */
  private async readPageBy(params: OrmReadPaginatedParams<Entity>): Promise<OrmPageDto<Entity>> {
    const { limit: bLimit, offset: bOffset, count: hasCount, sort, order: bOrder, populate, ...remainder } = params;

    const limit = bLimit ?? 100;
    const offset = bOffset ?? 0;

    let order: OrmQueryOrder;
    let orderBy;

    if (sort) {
      order = bOrder || OrmQueryOrder.ASC;
      orderBy = [ sort.split('.').reverse().reduce((acc: unknown, v) => ({ [v]: acc }), order) ];
    }

    const readParams: OrmReadParams<Entity> = remainder as any;
    const readPromise = this.readBy(readParams, { orderBy, limit, offset, populate });

    const countPromise = hasCount
      ? this.countBy(readParams)
      : undefined;

    const [ count, records ] = await Promise.all([ countPromise, readPromise ]);

    const nextPromise = records.length === limit
      ? this.createToken({ ...params, offset: offset + limit })
      : null;

    const previousPromise = offset
      ? this.createToken({ ...params, offset: offset - limit })
      : null
     ;
    const [ next, previous ] = await Promise.all([ nextPromise, previousPromise ]);

    return { next, previous, limit, offset, count, sort, order, records };
  }

  /**
   * Generates a token for given pagination context.
   * @param params
   */
  private async createToken(params: OrmReadPaginatedParams<Entity>): Promise<string> {
    const { pageTokenTtl } = this.repositoryOptions;
    const defaultTtl = 5 * 60 * 1000;
    const ttl = pageTokenTtl ?? defaultTtl;

    const token = crypto.randomBytes(16).toString('hex');
    const cacheService = AppModule.getInstance().get(CacheService);
    await cacheService.getProvider().set(token, params, { ttl });

    return token;
  }

  /**
   * Acquires pagination context related to given token.
   * @param token
   */
  private async readTokenContext(token: string): Promise<OrmReadPaginatedParams<Entity>> {
    const cacheService = AppModule.getInstance().get(CacheService);
    const params = await cacheService.getProvider().get(token);

    if (!params) {
      throw new BadRequestException('token is invalid or expired');
    }

    return params as OrmReadPaginatedParams<Entity>;
  }

}
