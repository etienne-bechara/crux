import crypto from 'node:crypto';
import { DynamicModule, Module } from '@nestjs/common';

import { LogModule } from '../log/log.module';
import { SchemaInjectionToken } from './schema.enum';
import { SchemaAsyncModuleOptions, SchemaModuleOptions } from './schema.interface';
import { SchemaService } from './schema.service';

@Module({
  imports: [LogModule],
  providers: [
    SchemaService,
    {
      provide: SchemaInjectionToken.MODULE_OPTIONS,
      useValue: {},
    },
  ],
  exports: [SchemaService],
})
export class SchemaModule {
  /**
   * Registers underlying service with provided options.
   * @param options
   */
  public static register(options: SchemaModuleOptions): DynamicModule {
    return {
      module: SchemaModule,
      providers: [
        {
          provide: SchemaInjectionToken.MODULE_ID,
          useValue: crypto.randomBytes(8).toString('hex'),
        },
        {
          provide: SchemaInjectionToken.MODULE_OPTIONS,
          useValue: options,
        },
      ],
    };
  }

  /**
   * Register underlying service with provided options asynchronously.
   * @param options
   */
  public static registerAsync(options: SchemaAsyncModuleOptions): DynamicModule {
    return {
      module: SchemaModule,
      imports: options.imports,
      providers: [
        {
          provide: SchemaInjectionToken.MODULE_ID,
          useValue: crypto.randomBytes(8).toString('hex'),
        },
        {
          provide: SchemaInjectionToken.MODULE_OPTIONS,
          inject: options.inject,
          useFactory: options.useFactory,
        },
      ],
    };
  }
}
