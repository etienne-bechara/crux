import { EntityManager, EntityName } from '@mikro-orm/core';

import { OrmRepository } from '../../source/orm/orm.repository';
import { Address } from './address.entity';

export class AddressRepository extends OrmRepository<Address> {

  public constructor(
    protected readonly entityManager: EntityManager,
    protected readonly entityName: EntityName<Address>,
  ) {
    super(entityManager, entityName);
  }

}
