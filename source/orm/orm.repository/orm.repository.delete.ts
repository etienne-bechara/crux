import { EntityManager, EntityName } from '@mikro-orm/core';

import { OrmDeleteOptions, OrmReadParams, OrmRepositoryOptions } from '../orm.interface';
import { OrmUpdateRepository } from './orm.repository.update';

export abstract class OrmDeleteRepository<Entity extends object> extends OrmUpdateRepository<Entity> {

  public constructor(
    protected readonly entityManager: EntityManager,
    protected readonly entityName: EntityName<Entity>,
    protected readonly repositoryOptions: OrmRepositoryOptions<Entity>,
  ) {
    super(entityManager, entityName, repositoryOptions);
  }

  /**
   * Remove target entities and returns their reference.
   * @param entities
   * @param options
   */
  public delete<P extends string = never>(
    entities: Entity | Entity[],
    options: OrmDeleteOptions<Entity, P> = { },
  ): Promise<Entity[]> {
    return this.runWithinSpan('delete', async () => {
      if (!this.isValidData(entities)) return [ ];

      const { populate } = options;
      const entityArray = Array.isArray(entities) ? entities : [ entities ];

      if (populate) {
        // eslint-disable-next-line @typescript-eslint/no-unsafe-argument
        await this.populate(entityArray, populate as any);
      }

      await this.entityManager.removeAndFlush(entities);
      return entityArray;
    });
  }

  /**
   * Remove all entities that match target criteria.
   * @param params
   * @param options
   */
  public async deleteBy<P extends string = never>(
    params: OrmReadParams<Entity>,
    options: OrmDeleteOptions<Entity, P> = { },
  ): Promise<Entity[]> {
    const entities = await this.readBy(params, options);
    return this.delete(entities, options);
  }

  /**
   * Remove a single entity by its ID.
   * @param id
   * @param options
   */
  public async deleteById<P extends string = never>(
    id: string | number,
    options: OrmDeleteOptions<Entity, P> = { },
  ): Promise<Entity> {
    const entity = await this.readByIdOrFail(id);
    await this.delete(entity, options);
    return entity;
  }

  /**
   * Remove a single entity.
   * @param entity
   * @param options
   */
  public async deleteOne<P extends string = never>(
    entity: Entity,
    options: OrmDeleteOptions<Entity, P> = { },
  ): Promise<Entity> {
    const [ deletedEntity ] = await this.delete(entity, options);
    return deletedEntity;
  }

}
