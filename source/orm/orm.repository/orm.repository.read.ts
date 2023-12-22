import { EntityManager, EntityName, FindOptions } from '@mikro-orm/core';
import { AutoPath, FilterQuery } from '@mikro-orm/core/typings';
import { ConflictException, InternalServerErrorException, NotFoundException } from '@nestjs/common';

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
   * @param params
   */
  public async readPaginatedBy(params: OrmReadPaginatedParams<Entity>): Promise<OrmPageDto<Entity>> {
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

    let countPromise: Promise<number>;

    if (hasCount) {
      countPromise = this.countBy(readParams);
    }

    const [ count, records ] = await Promise.all([ countPromise, readPromise ]);

    return { limit, offset, count, sort, order, records };
  }

}
