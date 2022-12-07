export enum OrmInjectionToken {
  ORM_MODULE_OPTIONS = 'ORM_MODULE_OPTIONS',
  ORM_PROVIDER_OPTIONS = 'ORM_PROVIDER_OPTIONS',
  ORM_SCHEMA_OPTIONS = 'ORM_SCHEMA_OPTIONS',
}

export enum OrmQueryOrder {
  ASC = 'ASC',
  DESC = 'DESC',
}

export enum OrmException {
  ENTITY_CONFLICT = 'entity already exists',
  ENTITY_NOT_FOUND = 'entity does not exist',
  FOREIGN_KEY_FAIL = 'foreign key prevents cascade deletion',
  FOREIGN_KEY_NOT_FOUND = 'foreign key must reference an existing entity',
  UNIQUE_KEY_MISSING = 'missing default unique key definition',
  UNIQUE_KEY_FAIL = 'unique constraint references more than one entity',
}
