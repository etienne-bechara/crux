import { EntityManager, EntityName, RequiredEntityData } from '@mikro-orm/core';

import { OrmRepositoryOptions } from '../orm.interface';
import { OrmReadRepository } from './orm.repository.read';

export abstract class OrmCreateRepository<Entity extends object> extends OrmReadRepository<Entity> {

  public constructor(
    protected readonly entityManager: EntityManager,
    protected readonly entityName: EntityName<Entity>,
    protected readonly repositoryOptions: OrmRepositoryOptions<Entity>,
  ) {
    super(entityManager, entityName, repositoryOptions);
  }

  /**
   * Constructs multiples entities without persisting them.
   * @param data
   */
  public build(data: RequiredEntityData<Entity> | RequiredEntityData<Entity>[]): Entity[] {
    if (!this.isValidData(data)) return [ ];

    const dataArray = Array.isArray(data) ? data : [ data ];
    return dataArray.map((d) => this.entityManager.create(this.entityName, d));
  }

  /**
   * Constructs a single entity without persisting it.
   * @param data
   * @returns
   */
  public buildOne(data: RequiredEntityData<Entity>): Entity {
    return this.build(data)[0];
  }

  /**
   * Create multiple entities based on provided data.
   * @param data
   */
  public create(data: RequiredEntityData<Entity> | RequiredEntityData<Entity>[]): Promise<Entity[]> {
    return this.runWithinSpan('create', async () => {
      const newEntities = this.build(data);
      await this.entityManager.persistAndFlush(newEntities);
      return newEntities;
    });
  }

  /**
   * Create a single entity based on provided data, persist changes on next commit call.
   * @param data
   */
  public async createOne(data: RequiredEntityData<Entity>): Promise<Entity> {
    const [ newEntity ] = await this.create(data);
    return newEntity;
  }

}
