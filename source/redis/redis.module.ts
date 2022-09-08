import { DynamicModule, Module } from '@nestjs/common';
import crypto from 'crypto';

import { RedisInjectionToken } from './redis.enum';
import { RedisAsyncModuleOptions, RedisModuleOptions } from './redis.interface';
import { RedisService } from './redis.service';

@Module({
  providers: [
    RedisService,
    {
      provide: RedisInjectionToken.REDIS_MODULE_OPTIONS,
      useValue: { },
    },
  ],
  exports: [
    RedisService,
    RedisInjectionToken.REDIS_MODULE_OPTIONS,
  ],
})
export class RedisModule {

  /**
   * Configures the underlying Redis service synchronously.
   * @param options
   */
  public static register(options: RedisModuleOptions = { }): DynamicModule {
    return {
      module: RedisModule,
      providers: [
        {
          provide: RedisInjectionToken.REDIS_MODULE_ID,
          useValue: crypto.randomBytes(8).toString('hex'),
        },
        {
          provide: RedisInjectionToken.REDIS_MODULE_OPTIONS,
          useValue: options,
        },
      ],
    };
  }

  /**
   * Configure the underlying service asynchronously which allows
   * acquiring data from other injectable services (i.e. Config).
   * @param options
   */
  public static registerAsync(options: RedisAsyncModuleOptions = { }): DynamicModule {
    return {
      module: RedisModule,
      imports: options.imports,
      providers: [
        {
          provide: RedisInjectionToken.REDIS_MODULE_ID,
          useValue: crypto.randomBytes(8).toString('hex'),
        },
        {
          provide: RedisInjectionToken.REDIS_MODULE_OPTIONS,
          inject: options.inject,
          useFactory: options.useFactory,
        },
      ],
    };
  }

}
