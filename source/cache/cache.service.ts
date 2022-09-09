import { Injectable } from '@nestjs/common';
import zlib from 'zlib';

import { AppConfig } from '../app/app.config';
import { ContextService } from '../context/context.service';
import { LogService } from '../log/log.service';
import { MemoryService } from '../memory/memory.service';
import { PromiseService } from '../promise/promise.service';
import { RedisService } from '../redis/redis.service';
import { CacheProvider, CacheTtlOptions } from './cache.interface';

@Injectable()
export class CacheService {

  private cacheProvider: CacheProvider;

  public constructor(
    private readonly appConfig: AppConfig,
    private readonly contextService: ContextService,
    private readonly logService: LogService,
    private readonly memoryService: MemoryService,
    private readonly promiseService: PromiseService,
    private readonly redisService: RedisService,
  ) {
    this.setupProvider();
  }

  /**
   * Configures the cache provider, memory will be used
   * unless a Redis connection is provided.
   */
  private setupProvider(): void {
    this.cacheProvider = this.redisService.isInitialized()
      ? this.redisService
      : this.memoryService;
  }

  /**
   * Builds caching key for current request.
   */
  private buildCacheDataKey(): string {
    const { name } = this.appConfig.APP_OPTIONS;
    const method = this.contextService.getRequestMethod();
    const path = this.contextService.getRequest().url.split('?')[0];
    const query = this.contextService.getRequestQuery();
    const sortedQueryObject = Object.fromEntries(Object.entries(query || { }).sort());
    const sortedQuery = new URLSearchParams(sortedQueryObject).toString();
    return `cache:data:${name}:${method}:${path}${sortedQuery ? `:${sortedQuery}` : ''}`;
  }

  /**
   * Builds caching key for target bucket.
   * @param bucket
   */
  private buildCacheBucketKey(bucket: string): string {
    return `cache:bucket:${bucket}`;
  }

  /**
   * Acquire cached data for current request, for any route decorated
   * with `@Cache()` this method will be automatically called before
   * the request reaches the controller.
   */
  public async getCache<T>(): Promise<T> {
    const { disableCompression } = this.appConfig.APP_OPTIONS.cache || { };
    const dataKey = this.buildCacheDataKey();

    let value: any = disableCompression
      ? await this.cacheProvider.get(dataKey)
      : await this.cacheProvider.getBuffer(dataKey);

    if (!value) return;

    if (!disableCompression) {
      const uncompressed: Buffer = await new Promise((res, rej) => {
        return zlib.gunzip(value as Buffer, (e, d) => e ? rej(e) : res(d));
      });

      value = JSON.parse(uncompressed.toString());
    }

    return value;
  }

  /**
   * Asynchronously sets cached data for current request, for any route
   * decorated with `@Cache()` this method will be automatically called\
   * before the response is sent to client.
   * @param value
   * @param options
   */
  public setCache(value: any, options: CacheTtlOptions = { }): void {
    void this.setCacheHandler(value, options);
  }

  /**
   * Handler of setCache().
   * @param value
   * @param options
   */
  private async setCacheHandler(value: any, options: CacheTtlOptions = { }): Promise<void> {
    const { disableCompression } = this.appConfig.APP_OPTIONS.cache || { };
    const dataKey = this.buildCacheDataKey();
    let data = value;

    try {
      if (!disableCompression) {
        data = await new Promise((res, rej) => {
          return zlib.gzip(Buffer.from(JSON.stringify(value)), (e, d) => e ? rej(e) : res(d));
        });
      }

      await this.cacheProvider.set(dataKey, data, options);
    }
    catch (e) {
      this.logService.error('failed to set cache data', e as Error, { data });
    }
  }

  /**
   * Asynchronously ties cached data for current request with
   * target buckets which can be individually invalidated.
   * @param buckets
   */
  public setBuckets(buckets: string[]): void {
    void this.setBucketsHandler(buckets);
  }

  /**
   * Handler of setBuckets().
   * @param buckets
   */
  private async setBucketsHandler(buckets: string[]): Promise<void> {
    const { bucketTtl: ttl } = this.appConfig.APP_OPTIONS.cache || { };

    try {
      await this.promiseService.resolveLimited({
        data: buckets,
        limit: 1000,
        promise: async (b) => {
          const bucketKey = this.buildCacheBucketKey(b);
          const dataKey = this.buildCacheDataKey();
          await this.cacheProvider.sadd(bucketKey, dataKey, { ttl });
        },
      });
    }
    catch (e) {
      this.logService.error('failed to set cache buckets', e as Error, { buckets });
    }
  }

  /**
   * Asynchronously invalidate target buckets which deletes
   * their related cache data keys.
   * @param buckets
   */
  public invalidateBuckets(buckets: string[]): void {
    void this.invalidateBucketsHandler(buckets);
  }

  /**
   * Asynchronously invalidate target buckets which deletes
   * their related cache data keys.
   * @param buckets
   */
  private async invalidateBucketsHandler(buckets: string[]): Promise<void> {
    const delPromises: Promise<void>[] = [ ];

    try {
      await this.promiseService.resolveLimited({
        data: buckets,
        limit: 1000,
        promise: async (b) => {
          const bucketKey = this.buildCacheBucketKey(b);
          const dataSet = await this.cacheProvider.smembers(bucketKey);
          delPromises.push(this.cacheProvider.del(bucketKey) as Promise<void>);

          for (const dataKey of dataSet) {
            delPromises.push(this.cacheProvider.del(dataKey) as Promise<void>);
          }
        },
      });

      await Promise.all(delPromises);
    }
    catch (e) {
      this.logService.error('failed to invalidate cache buckets', e as Error, { buckets });
    }
  }

}
