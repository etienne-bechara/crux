import { EntityManager, EntityName, RequiredEntityData } from '@mikro-orm/core';

import { OrmRepositoryOptions } from '../orm.interface';
import { OrmReadRepository } from './orm.repository.read';

export abstract class OrmCreateRepository<Entity> extends OrmReadRepository<Entity> {

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
    const dataArray = Array.isArray(data) ? data : [ data ];

    return data && dataArray.length > 0
      ? dataArray.map((d) => this.entityManager.create(this.entityName, d))
      : [ ];
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
   * Create multiple entities based on provided data, persist changes on next commit call.
   * @param data
   */
  public createFromAsync(data: RequiredEntityData<Entity> | RequiredEntityData<Entity>[]): Entity[] {
    const newEntities = this.build(data);
    this.commitAsync(newEntities);
    return newEntities;
  }

  /**
   * Create multiple entities based on provided data.
   * @param data
   */
  public createFrom(data: RequiredEntityData<Entity> | RequiredEntityData<Entity>[]): Promise<Entity[]> {
    return this.runWithinClearContextSpan('create', async () => {
      const newEntities = this.createFromAsync(data);
      await this.commit();
      return newEntities;
    });
  }

  /**
   * Create a single entity based on provided data, persist changes on next commit call.
   * @param data
   */
  public createOneAsync(data: RequiredEntityData<Entity>): Entity {
    const [ newEntity ] = this.createFromAsync(data);
    return newEntity;
  }

  /**
   * Create a single entity based on provided data, persist changes on next commit call.
   * @param data
   */
  public createOne(data: RequiredEntityData<Entity>): Promise<Entity> {
    return this.runWithinClearContextSpan('create', async () => {
      const newEntity = this.createOneAsync(data);
      await this.commit();
      return newEntity;
    });
  }

}
