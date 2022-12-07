import { EntityManager, EntityName, FindOptions } from '@mikro-orm/core';
import { AutoPath } from '@mikro-orm/core/typings';
import { ConflictException, NotFoundException } from '@nestjs/common';

import { OrmPageDto } from '../orm.dto';
import { OrmException } from '../orm.enum';
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
    return this.runWithinSpan('Populate', async () => {
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
    return this.runWithinSpan('Read', async () => {
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
    return this.runWithinSpan('Count', async () => {
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
