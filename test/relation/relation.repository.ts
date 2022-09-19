import { EntityManager, EntityName } from '@mikro-orm/core';

import { OrmRepository } from '../../source/orm/orm.repository';
import { Relation } from './relation.entity';

export class RelationRepository extends OrmRepository<Relation> {

  public constructor(
    protected readonly entityManager: EntityManager,
    protected readonly entityName: EntityName<Relation>,
  ) {
    super(entityManager, entityName, {
      defaultUniqueKey: [ 'parent', 'child' ],
    });
  }

}
