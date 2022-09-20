import { EntityManager, EntityName, EventSubscriber } from '@mikro-orm/core';

import { OrmSubscriberChangeset, OrmSubscriberOptions, OrmSubscriberParams } from './orm.interface';

export abstract class OrmSubscriber<Entity> implements EventSubscriber<Entity> {

  public constructor(
    protected readonly entityManager: EntityManager,
    protected readonly ormSubscriberOptions: OrmSubscriberOptions,
  ) {
    entityManager.getEventManager().registerSubscriber(this);
  }

  /**
   * Filter target entities to subscribe.
   */
  public getSubscribedEntities(): EntityName<Entity>[] {
    const { entities } = this.ormSubscriberOptions;
    return Array.isArray(entities) ? entities : [ entities ];
  }

  /**
   * Get entity changeset, useful for 'update' hooks.
   * @param params
   */
  protected getChangeset(params: OrmSubscriberParams<Entity>): OrmSubscriberChangeset<Entity> {
    const { changeSet } = params;
    const { entity, originalEntity } = changeSet;

    return {
      before: originalEntity,
      after: entity,
    };
  }

}
