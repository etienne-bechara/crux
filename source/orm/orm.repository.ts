import { EntityManager, EntityName } from '@mikro-orm/core';

import { OrmRepositoryOptions } from './orm.interface';
import { OrmDeleteRepository } from './orm.repository/orm.repository.delete';

export abstract class OrmRepository<Entity extends object> extends OrmDeleteRepository<Entity> {

  public constructor(
    protected readonly entityManager: EntityManager,
    protected readonly entityName: EntityName<Entity>,
    protected readonly repositoryOptions: OrmRepositoryOptions<Entity> = { },
  ) {
    super(entityManager, entityName, repositoryOptions);
  }

}
