import { EntityManager, EntityName } from '@mikro-orm/core';

import { OrmRepository } from '../../source/orm/orm.repository';
import { Order } from './order.entity';

export class OrderRepository extends OrmRepository<Order> {

  public constructor(
    protected readonly entityManager: EntityManager,
    protected readonly entityName: EntityName<Order>,
  ) {
    super(entityManager, entityName);
  }

}
