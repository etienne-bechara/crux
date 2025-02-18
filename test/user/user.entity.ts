import { Collection, Entity, ManyToMany, OneToMany, OneToOne, Property, Unique } from '@mikro-orm/core';

import { OrmUuidTimestampEntity } from '../../source/orm/orm.entity';
import { IsEmail, IsNumber, IsOptional, IsString } from '../../source/validate/validate.decorator';
import { Address } from '../address/address.entity';
import { Metadata } from '../metadata/metadata.entity';
import { Order } from '../order/order.entity';
import { Relation } from '../relation/relation.entity';
import { UserRepository } from './user.repository';

@Entity({ repository: () => UserRepository })
@Unique({ properties: [ 'name' ] })
export class User extends OrmUuidTimestampEntity {

  @IsString()
  @Property()
  public name!: string;

  @Property()
  @IsNumber()
  public age!: number;

  @Property({ nullable: true })
  @IsOptional()
  @IsEmail()
  public email?: string;

  @OneToOne(() => Address, 'user', { orphanRemoval: true })
  public address?: Address;

  @OneToMany(() => Order, 'user')
  public orders = new Collection<Order>(this);

  @OneToMany(() => Metadata, 'user', { orphanRemoval: true })
  public metadata = new Collection<Metadata>(this);

  @ManyToMany(() => User, 'children', {
    owner: true,
    pivotEntity: () => Relation,
    inverseJoinColumn: 'parent_id',
    joinColumn: 'child_id',
  })
  public parents = new Collection<User>(this);

  @ManyToMany(() => User, 'parents')
  public children = new Collection<User>(this);

}
