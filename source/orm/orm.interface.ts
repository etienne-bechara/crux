import { EntityData, FilterQuery, FindOptions } from '@mikro-orm/core';
import { AutoPath } from '@mikro-orm/core/typings';
import { EntityName, MikroOrmModuleOptions } from '@mikro-orm/nestjs';
import { ModuleMetadata } from '@nestjs/common';

import { AppConfig } from '../app/app.config';
import { LogService } from '../log/log.service';
import { SchemaModuleOptions } from '../schema/schema.interface';
import { OrmPageReadDto } from './orm.dto.in';

export type OrmReadParams<T> = FilterQuery<T>;

export type OrmReadPaginatedParams<T> = FilterQuery<T> & OrmPageReadDto;

export interface OrmAsyncModuleOptions extends Pick<ModuleMetadata, 'imports'> {
  disableEntityScan?: boolean;
  entities?: any[];
  inject?: any[];
  useFactory?: (...args: any[]) => Promise<OrmModuleOptions> | OrmModuleOptions;
}

export interface OrmModuleOptions extends Omit<MikroOrmModuleOptions, 'type'> {
  sync?: SchemaModuleOptions;
}

export interface OrmBuildMikroOrmOptionsParams {
  options: OrmModuleOptions;
  entities: EntityName<Partial<any>>[];
  appConfig: AppConfig;
  logService: LogService;
}

export interface OrmExceptionHandlerParams {
  caller: (retries: number) => any;
  retries: number;
  error: Error;
}

export interface OrmUpdateParams<Entity> {
  entity: Entity;
  data: EntityData<Entity>;
}

export interface OrmRepositoryOptions<Entity> {
  nestedPrimaryKeys?: string[];
  defaultPopulate?: string[];
  defaultUniqueKey?: (keyof Entity)[];
  pageTokenTtl?: number;
}

export interface OrmReadArguments<Entity, P extends string> {
  params: OrmReadParams<Entity>;
  options: OrmReadOptions<Entity, P>;
}

export interface OrmReadOptions<Entity, P extends string> extends Omit<FindOptions<Entity, P>, 'populate'> {
  populate?: AutoPath<Entity, P>[] | boolean | string[];
  findOrFail?: boolean;
}

export interface OrmUpsertOptions<Entity, P extends string> {
  populate?: AutoPath<Entity, P>[] | boolean | string[];
  uniqueKey?: (keyof Entity)[];
  disallowUpdate?: boolean;
  disallowRetry?: boolean;
}
