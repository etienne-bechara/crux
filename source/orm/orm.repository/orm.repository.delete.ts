import { EntityManager, EntityName } from '@mikro-orm/core';

import { OrmDeleteOptions, OrmReadParams, OrmRepositoryOptions } from '../orm.interface';
import { OrmUpdateRepository } from './orm.repository.update';

export abstract class OrmDeleteRepository<Entity> extends OrmUpdateRepository<Entity> {

  public constructor(
    protected readonly entityManager: EntityManager,
    protected readonly entityName: EntityName<Entity>,
    protected readonly repositoryOptions: OrmRepositoryOptions<Entity>,
  ) {
    super(entityManager, entityName, repositoryOptions);
  }

  /**
   * Remove target entities and returns their reference, persist changes on next commit call.
   * @param entities
   */
  public deleteAsync(entities: Entity | Entity[]): Entity[] {
    const entityArray = Array.isArray(entities) ? entities : [ entities ];
    if (!entities || entityArray.length === 0) return [ ];

    this.removeAsync(entities);
    return entityArray;
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
    const { populate } = options;
    const entityArray = Array.isArray(entities) ? entities : [ entities ];
    if (!entities || entityArray.length === 0) return new Promise((r) => r([ ]));

    return this.runWithinClearContextSpan('delete', async () => {
      if (populate) {
        // eslint-disable-next-line @typescript-eslint/no-unsafe-argument
        await this.populate(entityArray, populate as any);
      }

      this.deleteAsync(entityArray);
      await this.commit();

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
   * Remove a single entity by its ID, persist changes on next commit call.
   * @param id
   */
  public deleteByIdAsync(id: string | number): void {
    const pk = this.getPrimaryKey();
    this.deleteAsync({ [pk]: id } as unknown as Entity);
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
   * Remove a single entity, persist changes on next commit call.
   * @param entity
   */
  public deleteOneAsync(entity: Entity): Entity {
    const [ deletedEntity ] = this.deleteAsync(entity);
    return deletedEntity;
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
