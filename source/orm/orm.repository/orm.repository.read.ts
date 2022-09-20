import { EntityManager, EntityName, FindOptions } from '@mikro-orm/core';
import { ConflictException, NotFoundException } from '@nestjs/common';

import { OrmPagination } from '../orm.dto';
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
   * Read entities matching given criteria, allowing pagination
   * and population options.
   * @param params
   * @param options
   * @param retries
   */
  public async readBy<P extends string = never>(
    params: OrmReadParams<Entity>,
    options: OrmReadOptions<Entity, P> = { },
    retries = 0,
  ): Promise<Entity[]> {
    return this.runWithinSpan('read', async () => {
      if (!params || Array.isArray(params) && params.length === 0) return [ ];
      let readEntities: Entity[];

      options.populate ??= this.repositoryOptions.defaultPopulate as any ?? false;
      options.refresh ??= true;

      try {
        readEntities = await this.entityManager.find(this.entityName, params, options as FindOptions<Entity, P>);
        readEntities ??= [ ];
      }
      catch (e) {
        return OrmBaseRepository.handleException({
          caller: (retries) => this.readBy(params, options, retries),
          retries,
          error: e,
        });
      }

      if (!readEntities[0] && options.findOrFail) {
        throw new NotFoundException('entity does not exist');
      }

      return readEntities;
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
    const pk = this.getPrimaryKey();
    const entities = await this.readBy({ [pk]: id } as unknown as Entity, options);
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
        message: 'unique constraint references more than one entity',
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
   * @param retries
   */
  public countBy(params: OrmReadParams<Entity>, retries = 0): Promise<number> {
    return this.runWithinSpan('count', async () => {
      try {
        if (!params || Array.isArray(params) && params.length === 0) return 0;
        return this.entityManager.count(this.entityName, params);
      }
      catch (e) {
        return OrmBaseRepository.handleException({
          caller: (retries) => this.countBy(params, retries),
          retries,
          error: e,
        });
      }
    });
  }

  /**
   * Read entities with pagination support including sort, order,
   * limit, offset and whether to include total count or not.
   * @param params
   */
  public async readPaginatedBy(params: OrmReadPaginatedParams<Entity>): Promise<OrmPagination<Entity>> {
    const { limit: bLimit, offset: bOffset, count: hasCount, sort, order, populate, ...remainder } = params;

    const limit = bLimit ?? 100;
    const offset = bOffset ?? 0;
    const orderBy = sort && order ? [ { [sort]: order } ] : undefined;

    const readParams: OrmReadParams<Entity> = remainder as any;
    const readPromise = this.readBy(readParams, { orderBy, limit, offset, populate });

    let countPromise: Promise<number>;

    if (hasCount) {
      countPromise = this.countBy(readParams);
    }

    const [ count, records ] = await Promise.all([ countPromise, readPromise ]);

    return { limit, offset, count, sort, order, records };
  }

}
