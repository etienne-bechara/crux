import { EntityManager, EntityName, OrmRepository } from '@bechara/crux';

import { User } from './user.entity';

export class UserRepository extends OrmRepository<User> {

  public constructor(
    protected readonly entityManager: EntityManager,
    protected readonly entityName: EntityName<User>,
  ) {
    super(entityManager, entityName, {
      defaultUniqueKey: [ 'email' ],
    });
  }

}
