import { Collection, Entity, ManyToMany, Property } from '@mikro-orm/core';

import { OrmUuidTimestampEntity } from '../../source/orm/orm.entity';
import { Order } from '../order/order.entity';
import { ProductRepository } from './product.repository';

@Entity({ customRepository: () => ProductRepository })
export class Product extends OrmUuidTimestampEntity {

  @Property()
  public title: string;

  @Property({ columnType: 'float' })
  public price: number;

  @ManyToMany(() => Order, 'products')
  public orders = new Collection<Order>(this);

}
