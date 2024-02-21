import { AnyEntity, BaseEntity, Index, PrimaryKey, Property } from '@mikro-orm/core';
import { v4 as uuidV4 } from 'uuid';

import { OrmBigIntDto, OrmBigIntTimestampDto, OrmIntDto, OrmIntTimestampDto, OrmTimestampDto, OrmUuidDto, OrmUuidTimestampDto } from './orm.dto.out';

export abstract class OrmBaseEntity extends BaseEntity<AnyEntity, 'id'> {

  /**
   * During serialization eliminate recursion to self entity.
   * @param args
   */
  // eslint-disable-next-line @typescript-eslint/naming-convention
  public toJSON(...args: any[]): any {
    // eslint-disable-next-line @typescript-eslint/no-unsafe-argument
    const serializedObject = super.toJSON(...args);
    const primitiveClone: Record<string, unknown> = { };

    for (const key in serializedObject) {
      if ([ 'string', 'number', 'boolean' ].includes(typeof serializedObject[key])) {
        primitiveClone[key] = serializedObject[key];
      }
    }

    return this.deleteRecursion(serializedObject, primitiveClone);
  }

  /**
   * Delete nested occurrences of current entity.
   * @param obj
   * @param parent
   */
  private deleteRecursion(obj: any, parent: Record<string, unknown>): any {
    const parentKeys = Object.keys(parent).length;
    if (!parentKeys) return obj;

    for (const objKey in obj) {
      const value = obj[objKey];

      if (Array.isArray(value)) {
        obj[objKey] = value.map((i) => this.deleteRecursion(i, parent));
      }
      else if (typeof value === 'object') {
        let matchingKeys = 0;

        for (const parentKey in parent) {
          if (obj[objKey]?.[parentKey] === parent[parentKey]) {
            matchingKeys++;
          }
          else {
            break;
          }
        }

        if (parentKeys === matchingKeys) {
          delete obj[objKey];
        }
      }
    }

    return obj;
  }

}

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
