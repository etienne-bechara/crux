import { AnyEntity, BaseEntity, Index, PrimaryKey, Property } from '@mikro-orm/core';
import { v4 as uuidV4 } from 'uuid';

import { OrmBigIntDto, OrmBigIntTimestampDto, OrmIntDto, OrmIntTimestampDto, OrmTimestampDto, OrmUuidDto, OrmUuidTimestampDto } from './orm.dto.out';

export abstract class OrmBaseEntity extends BaseEntity<AnyEntity, 'id'> { }

export abstract class OrmIntEntity extends OrmBaseEntity implements OrmIntDto {

  @PrimaryKey()
  public id: number;

}

export abstract class OrmBigIntEntity extends OrmBaseEntity implements OrmBigIntDto {

  @PrimaryKey({ columnType: 'bigint' })
  public id: number;

}

export abstract class OrmUuidEntity extends OrmBaseEntity implements OrmUuidDto {

  @PrimaryKey({ length: 36 })
  public id: string = uuidV4();

}

export abstract class OrmTimestampEntity extends OrmBaseEntity implements OrmTimestampDto {

  @Index()
  @Property({ columnType: 'timestamp', onUpdate: () => new Date() })
  public updated: Date = new Date();

  @Index()
  @Property({ columnType: 'timestamp' })
  public created: Date = new Date();

}

export abstract class OrmIntTimestampEntity extends OrmTimestampEntity implements OrmIntTimestampDto {

  @PrimaryKey()
  public id: number;

}

export abstract class OrmBigIntTimestampEntity extends OrmTimestampEntity implements OrmBigIntTimestampDto {

  @PrimaryKey({ columnType: 'bigint' })
  public id: number;

}

export abstract class OrmUuidTimestampEntity extends OrmTimestampEntity implements OrmUuidTimestampDto {

  @PrimaryKey({ length: 36 })
  public id: string = uuidV4();

}
