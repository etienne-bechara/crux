import { Injectable } from '@nestjs/common';
import zlib from 'zlib';

import { AppConfig } from '../app/app.config';
import { ContextService } from '../context/context.service';
import { MemoryService } from '../memory/memory.service';
import { RedisService } from '../redis/redis.service';
import { CacheProvider, CacheTtlOptions } from './cache.interface';

@Injectable()
export class CacheService {

  private cacheProvider: CacheProvider;

  public constructor(
    private readonly appConfig: AppConfig,
    private readonly contextService: ContextService,
    private readonly memoryService: MemoryService,
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
   * Sets cached data for current request, for any route decorated
   * with `@Cache()` this method will be automatically called before
   * the response is sent to client.
   * @param value
   * @param options
   */
  public async setCache(value: any, options: CacheTtlOptions = { }): Promise<void> {
    const { disableCompression } = this.appConfig.APP_OPTIONS.cache || { };
    const dataKey = this.buildCacheDataKey();
    let data = value;

    if (!disableCompression) {
      data = await new Promise((res, rej) => {
        return zlib.gzip(Buffer.from(JSON.stringify(value)), (e, d) => e ? rej(e) : res(d));
      });
    }

    await this.cacheProvider.set(dataKey, data, options);
  }

  /**
   * Ties cached data for current request with target buckets which
   * can be individually invalidated.
   *
   * Bucket sets creation will occur asynchronously after data has
   * been cached and sent to client.
   * @param buckets
   */
  public setBuckets(buckets: string[]): void {
    this.contextService.setCacheBuckets(buckets);
  }

  /**
   * Ties cached data for current request with target buckets which
   * can be individually invalidated.
   *
   * Bucket sets creation will start immediately.
   * @param buckets
   */
  public async setBucketsSync(buckets: string[]): Promise<void> {
    const ttl = 60 * 1000;

    await Promise.all(buckets.map(async (b) => {
      const bucketKey = this.buildCacheBucketKey(b);
      const dataKey = this.buildCacheDataKey();
      await this.cacheProvider.sadd(bucketKey, dataKey, { ttl });
    }));
  }

  /**
   * Invalidate target buckets and their related cached keys immediately.
   * @param buckets
   */
  public async invalidateBucketsSync(buckets: string[]): Promise<void> {
    const delPromises: Promise<void>[] = [ ];

    await Promise.all(buckets.map(async (b) => {
      const bucketKey = this.buildCacheBucketKey(b);
      const set = await this.cacheProvider.smembers(bucketKey);

      for (const key of set) {
        delPromises.push(this.cacheProvider.del(key) as Promise<void>);
      }
    }));

    await Promise.all(delPromises);
  }

}
