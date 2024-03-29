import { Entity, OrmUuidTimestampEntity, Property, Unique } from '@bechara/crux';

import { UserRepository } from './user.repository';

@Entity({ customRepository: () => UserRepository })
@Unique({ properties: [ 'email' ] })
export class User extends OrmUuidTimestampEntity {

  @Property()
  public email: string;

  @Property({ nullable: true })
  public name?: string;

  @Property({ nullable: true })
  public age?: number;

  @Property({ nullable: true })
  public alive?: boolean;

  @Property({ nullable: true })
  public taxId?: string;

  @Property({ nullable: true })
  public phone?: string;

}
