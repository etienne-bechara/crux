import { Module } from '@nestjs/common';

import { AppConfig } from '../app/app.config';
import { RedisModule } from '../redis/redis.module';
import { CacheConfig } from './cache.config';
import { CacheService } from './cache.service';

@Module({
  imports: [
    RedisModule.registerAsync({
      inject: [ AppConfig, CacheConfig ],
      useFactory: (appConfig: AppConfig, cacheConfig: CacheConfig) => ({
        host: cacheConfig.CACHE_HOST ?? appConfig.APP_OPTIONS.cache?.host,
        port: cacheConfig.CACHE_PORT ?? appConfig.APP_OPTIONS.cache?.port,
        username: cacheConfig.CACHE_USERNAME ?? appConfig.APP_OPTIONS.cache?.username,
        password: cacheConfig.CACHE_PASSWORD ?? appConfig.APP_OPTIONS.cache?.password,
      }),
    }),
  ],
  providers: [
    CacheConfig,
    CacheService,
  ],
  exports: [
    CacheConfig,
    CacheService,
  ],
})
export class CacheModule { }

@Module({
  providers: [
    { provide: CacheService, useValue: null },
  ],
  exports: [
    { provide: CacheService, useValue: null },
  ],
})
export class CacheDisabledModule { }
