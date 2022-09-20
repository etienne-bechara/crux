import { Collection, Entity, Enum, ManyToMany, ManyToOne } from '@mikro-orm/core';

import { OrmUuidTimestampEntity } from '../../source/orm/orm.entity';
import { Product } from '../product/product.entity';
import { User } from '../user/user.entity';
import { OrderStatus } from './order.enum';
import { OrderRepository } from './order.repository';

@Entity({ customRepository: () => OrderRepository })
export class Order extends OrmUuidTimestampEntity {

  @Enum(() => OrderStatus)
  public status = OrderStatus.PENDING;

  @ManyToMany(() => Product, 'orders', { owner: true })
  public products = new Collection<Product>(this);

  @ManyToOne(() => User)
  public user: User;

}
