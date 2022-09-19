import { EntityManager, EntityName } from '@mikro-orm/core';

import { OrmRepository } from '../../source/orm/orm.repository';
import { Product } from './product.entity';

export class ProductRepository extends OrmRepository<Product> {

  public constructor(
    protected readonly entityManager: EntityManager,
    protected readonly entityName: EntityName<Product>,
  ) {
    super(entityManager, entityName);
  }

}
