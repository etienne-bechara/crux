import { EntityManager, MikroORMOptions } from '@mikro-orm/core';
import { MikroOrmModule } from '@mikro-orm/nestjs';
import { DynamicModule, Global, Module } from '@nestjs/common';
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
import { OrmBaseEntity, OrmBigIntEntity, OrmBigIntTimestampEntity, OrmIntEntity, OrmIntTimestampEntity, OrmTimestampEntity, OrmUuidEntity, OrmUuidTimestampEntity } from './orm.entity';
import { OrmInjectionToken } from './orm.enum';
import { OrmInterceptor } from './orm.interceptor';
import { OrmAsyncModuleOptions, OrmModuleOptions } from './orm.interface';

@Global()
@Module({ })
export class OrmModule {

  /**
   * Configure the underlying ORM component with the following additions:
   * - Adds built-in logger service for debugging (local only)
   * - Adds programmatically schema sync.
   * @param options
   */
  public static registerAsync(options: OrmAsyncModuleOptions): DynamicModule {
    const entities = options.disableEntityScan
      ? options.entities || [ ]
      : AppModule.globRequire([ 's*rc*/**/*.entity.{js,ts}' ]);

    const rootEntities = [
      OrmBaseEntity,
      OrmTimestampEntity,
      OrmIntEntity,
      OrmIntTimestampEntity,
      OrmBigIntEntity,
      OrmBigIntTimestampEntity,
      OrmUuidEntity,
      OrmUuidTimestampEntity,
      ...entities,
    ];

    return {
      module: OrmModule,

      imports: [
        MikroOrmModule.forRootAsync({
          inject: [ OrmInjectionToken.ORM_PROVIDER_OPTIONS ],
          useFactory: (mikroOrmOptions: OrmModuleOptions) => ({
            ...mikroOrmOptions,
            registerRequestContext: false,
            context: (): EntityManager => ContextStorage.getStore()?.get(ContextStorageKey.ORM_ENTITY_MANAGER),
          }),
        }),

        SchemaModule.registerAsync({
          inject: [ OrmInjectionToken.ORM_SCHEMA_OPTIONS ],
          useFactory: (schemaModuleOptions: SchemaModuleOptions) => schemaModuleOptions,
        }),

        MikroOrmModule.forFeature({ entities }),
      ],

      providers: [
        AppConfig,
        {
          provide: APP_INTERCEPTOR,
          useClass: OrmInterceptor,
        },
        {
          provide: OrmInjectionToken.ORM_MODULE_OPTIONS,
          inject: options.inject || [ ],
          useFactory: options.useFactory,
        },
        {
          provide: OrmInjectionToken.ORM_PROVIDER_OPTIONS,
          inject: [ OrmInjectionToken.ORM_MODULE_OPTIONS, LogService, AppConfig ],
          useFactory: (
            ormModuleOptions: OrmModuleOptions,
            logService: LogService,
            appConfig: AppConfig,
          ): MikroORMOptions => {
            const mikroOrmOptions: MikroORMOptions = { ...ormModuleOptions } as any;
            delete mikroOrmOptions['sync'];

            return {
              debug: appConfig.NODE_ENV === AppEnvironment.LOCAL,
              logger: (msg): void => logService.trace(msg.replace(/].+?m/, `] ${LogStyle.FG_BRIGHT_BLACK}`)),
              entities: rootEntities,
              ...mikroOrmOptions,
            };
          },
        },
        {
          provide: OrmInjectionToken.ORM_SCHEMA_OPTIONS,
          inject: [ OrmInjectionToken.ORM_MODULE_OPTIONS ],
          useFactory: (ormModuleOptions: OrmModuleOptions): SchemaModuleOptions => ormModuleOptions.sync,
        },
      ],

      exports: [
        OrmInjectionToken.ORM_PROVIDER_OPTIONS,
        OrmInjectionToken.ORM_SCHEMA_OPTIONS,
        MikroOrmModule.forFeature({ entities }),
        SchemaModule,
      ],
    };
  }

}
