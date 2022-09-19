import { AnyEntity, BaseEntity, Index, PrimaryKey, Property, wrap } from '@mikro-orm/core';
import { v4 as uuidV4 } from 'uuid';

import { IsInt, IsISO8601, IsUUID } from '../validate/validate.decorator';

export abstract class OrmBaseEntity extends BaseEntity<AnyEntity, 'id'> {

  /**
   * Extendable hook to apply custom steps before serialization.
   * @param object
   */
  protected beforeSerialization(object: any): any {
    return object;
  }

  /**
   * Overwrites built-in serialization method to add hook.
   * @param args
   */
  // eslint-disable-next-line @typescript-eslint/naming-convention
  public toJSON(...args: any[]): any {
    // eslint-disable-next-line @typescript-eslint/no-unsafe-argument
    const object = wrap(this, true).toObject(...args);
    return this.beforeSerialization(object);
  }

}

export abstract class OrmIntEntity extends OrmBaseEntity {

  @PrimaryKey()
  @IsInt()
  public id: number;

}

export abstract class OrmBigIntEntity extends OrmBaseEntity {

  @PrimaryKey({ columnType: 'bigint' })
  @IsInt()
  public id: number;

}

export abstract class OrmUuidEntity extends OrmBaseEntity {

  @PrimaryKey({ length: 36 })
  @IsUUID()
  public id: string = uuidV4();

}

export abstract class OrmTimestampEntity extends OrmBaseEntity {

  @Index()
  @Property({ columnType: 'timestamp', onUpdate: () => new Date(), nullable: true })
  @IsISO8601()
  public updated: Date = new Date();

  @Index()
  @Property({ columnType: 'timestamp', nullable: true })
  @IsISO8601()
  public created: Date = new Date();

}

export abstract class OrmIntTimestampEntity extends OrmTimestampEntity {

  @PrimaryKey()
  @IsInt()
  public id: number;

}

export abstract class OrmBigIntTimestampEntity extends OrmTimestampEntity {

  @PrimaryKey({ columnType: 'bigint' })
  @IsInt()
  public id: number;

}

export abstract class OrmUuidTimestampEntity extends OrmTimestampEntity {

  @PrimaryKey({ length: 36 })
  @IsUUID()
  public id: string = uuidV4();

}
