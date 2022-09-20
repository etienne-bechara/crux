import { Entity, Index, ManyToOne, Property } from '@mikro-orm/core';

import { OrmBaseEntity } from '../../source/orm/orm.entity';
import { User } from '../user/user.entity';
import { RelationRepository } from './relation.repository';

@Entity({ customRepository: () => RelationRepository })
@Index({ properties: [ 'created' ] })
export class Relation extends OrmBaseEntity {

  @ManyToOne(() => User, { primary: true })
  public child: User;

  @ManyToOne(() => User, { primary: true })
  public parent: User;

  @Property({ columnType: 'timestamp' })
  public created: Date = new Date();

}
