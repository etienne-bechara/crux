import { EntityClass, EntityManager, EntityName, MikroORMOptions } from '@mikro-orm/core';
import { MikroOrmModule } from '@mikro-orm/nestjs';
import { DynamicModule, Module, Provider } from '@nestjs/common';
import { APP_INTERCEPTOR } from '@nestjs/core';

import { AppConfig } from '../app/app.config';
import { AppEnvironment } from '../app/app.enum';
import { AppModule } from '../app/app.module';
import { ContextStorageKey } from '../context/context.enum';
import { ContextStorage } from '../context/context.storage';
import { LogStyle } from '../log/log.enum';
import { LogService } from '../log/log.service';
import { SchemaModuleOptions } from '../schema/schema.interface';
import { SchemaModule } from '../schema/schema.module';
import {
  OrmBaseEntity,
  OrmBigIntEntity,
  OrmBigIntTimestampEntity,
  OrmIntEntity,
  OrmIntTimestampEntity,
  OrmTimestampEntity,
  OrmUuidEntity,
  OrmUuidTimestampEntity,
} from './orm.entity';
import { OrmInjectionToken } from './orm.enum';
import { OrmInterceptor } from './orm.interceptor';
import { OrmAsyncModuleOptions, OrmBuildMikroOrmOptionsParams, OrmModuleOptions } from './orm.interface';

@Module({})
export class OrmModule {
  /**
   * Configure the underlying ORM component.
   * @param options
   */
  public static registerAsync(options: OrmAsyncModuleOptions): DynamicModule {
    const entities: EntityName<Partial<any>>[] = options.disableEntityScan
      ? options.entities || []
      : AppModule.globRequire(['s*rc*/**/*.entity.{js,ts}']);

    return {
      module: OrmModule,
      imports: OrmModule.buildImports(entities),
      providers: OrmModule.buildProviders(options, entities),
      exports: OrmModule.buildExports(entities),
    };
  }

  /**
   * Register the MikroORM with custom context to acquire entity manager
   * through async local storage, as well as SchemaModule for automatic
   * schema synchronization.
   * @param entities
   */
  private static buildImports(entities: EntityName<Partial<any>>[]): DynamicModule[] {
    return [
      MikroOrmModule.forRootAsync({
        inject: [OrmInjectionToken.ORM_PROVIDER_OPTIONS],
        useFactory: (mikroOrmOptions: OrmModuleOptions) => ({
          ...mikroOrmOptions,
          registerRequestContext: false,
          context: (): EntityManager => ContextStorage.getStore()?.get(ContextStorageKey.ORM_ENTITY_MANAGER),
        }),
      }),

      SchemaModule.registerAsync({
        inject: [OrmInjectionToken.ORM_SCHEMA_OPTIONS],
        useFactory: (schemaModuleOptions: SchemaModuleOptions) => schemaModuleOptions,
      }),

      MikroOrmModule.forFeature({ entities }),
    ] as DynamicModule[];
  }

  /**
   * Register the ORM serialization interceptor, and MikroORM options
   * with custom assignments.
   * @param options
   * @param entities
   */
  private static buildProviders(options: OrmAsyncModuleOptions, entities: EntityName<Partial<any>>[]): Provider[] {
    return [
      AppConfig,
      {
        provide: APP_INTERCEPTOR,
        useClass: OrmInterceptor,
      },
      {
        provide: OrmInjectionToken.ORM_MODULE_OPTIONS,
        inject: options.inject || [],
        useFactory: options.useFactory,
      },
      {
        provide: OrmInjectionToken.ORM_PROVIDER_OPTIONS,
        inject: [OrmInjectionToken.ORM_MODULE_OPTIONS, LogService, AppConfig],
        useFactory: (
          ormModuleOptions: OrmModuleOptions,
          logService: LogService,
          appConfig: AppConfig,
        ): MikroORMOptions =>
          OrmModule.buildMikroOrmOptions({
            options: ormModuleOptions,
            entities,
            logService,
            appConfig,
          }),
      },
      {
        provide: OrmInjectionToken.ORM_SCHEMA_OPTIONS,
        inject: [OrmInjectionToken.ORM_MODULE_OPTIONS],
        useFactory: (ormModuleOptions: OrmModuleOptions): SchemaModuleOptions => ormModuleOptions.sync || {},
      },
    ];
  }

  /**
   * Builds MikroORM options from OrmModule options, assign default params for improved ORM performance.
   * @param params
   */
  private static buildMikroOrmOptions(params: OrmBuildMikroOrmOptionsParams): MikroORMOptions {
    const { options, entities, appConfig, logService } = params;
    const { sync, ...mikroOrmOptions } = options;

    mikroOrmOptions.entities = [
      OrmBaseEntity,
      OrmTimestampEntity,
      OrmIntEntity,
      OrmIntTimestampEntity,
      OrmBigIntEntity,
      OrmBigIntTimestampEntity,
      OrmUuidEntity,
      OrmUuidTimestampEntity,
      ...entities,
    ] as EntityClass<Partial<any>>[];

    mikroOrmOptions.debug ??= appConfig.NODE_ENV === AppEnvironment.LOCAL;
    mikroOrmOptions.logger ??= (msg): void => logService.trace(msg.replace(/].+?m/, `] ${LogStyle.FG_BRIGHT_BLACK}`));

    if (mikroOrmOptions.pool) {
      mikroOrmOptions.pool.acquireTimeoutMillis ??= 2000;
    }

    return mikroOrmOptions as MikroORMOptions;
  }

  /**
   * Export option tokens and MikroORM as well as SchemaModule for usage
   * within application.
   * @param entities
   */
  private static buildExports(entities: EntityName<Partial<any>>[]): (string | DynamicModule | Provider)[] {
    return [
      OrmInjectionToken.ORM_PROVIDER_OPTIONS,
      OrmInjectionToken.ORM_SCHEMA_OPTIONS,
      MikroOrmModule.forFeature({ entities }),
      SchemaModule,
    ];
  }
}
