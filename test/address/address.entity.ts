import { Entity, Enum, OneToOne, Property } from '@mikro-orm/core';

import { OrmBaseEntity } from '../../source/orm/orm.entity';
import { User } from '../user/user.entity';
import { AddressState } from './address.enum';
import { AddressRepository } from './address.repository';

@Entity({ repository: () => AddressRepository })
export class Address extends OrmBaseEntity {
  @OneToOne(() => User, 'address', { primary: true, owner: true })
  public user!: User;

  @Property()
  public zip!: string;

  @Enum(() => AddressState)
  public state!: AddressState;
}
