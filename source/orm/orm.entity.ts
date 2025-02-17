import { BaseEntity, Index, PrimaryKey, Property } from '@mikro-orm/core';
import { randomUUID } from 'crypto';

export abstract class OrmBaseEntity extends BaseEntity {

  /**
   * Serializes current entity, can be extended in order to apply
   * custom rules.
   */
  // eslint-disable-next-line @typescript-eslint/naming-convention
  public toObject(): any {
    // eslint-disable-next-line @typescript-eslint/no-unsafe-argument
    return super.toObject();
  }

}

export abstract class OrmIntEntity extends OrmBaseEntity {

  @PrimaryKey()
  public id!: number;

}

export abstract class OrmBigIntEntity extends OrmBaseEntity {

  @PrimaryKey({ columnType: 'bigint' })
  public id!: number;

}

export abstract class OrmUuidEntity extends OrmBaseEntity {

  @PrimaryKey({ length: 36 })
  public id: string = randomUUID();

}

export abstract class OrmTimestampEntity extends OrmBaseEntity {

  @Index()
  @Property({ columnType: 'timestamp', onUpdate: () => new Date() })
  public updated: Date = new Date();

  @Index()
  @Property({ columnType: 'timestamp' })
  public created: Date = new Date();

}

export abstract class OrmIntTimestampEntity extends OrmTimestampEntity {

  @PrimaryKey()
  public id!: number;

}

export abstract class OrmBigIntTimestampEntity extends OrmTimestampEntity {

  @PrimaryKey({ columnType: 'bigint' })
  public id!: number;

}

export abstract class OrmUuidTimestampEntity extends OrmTimestampEntity {

  @PrimaryKey({ length: 36 })
  public id: string = randomUUID();

}
