import { Injectable } from '@nestjs/common';

import { ContextService } from '../context/context.service';
import { LogService } from '../log/log.service';
import { MemoryService } from '../memory/memory.service';
import { PromiseService } from '../promise/promise.service';
import { RedisService } from '../redis/redis.service';
import { CacheBucketOptions, CacheProvider, CacheTtlOptions } from './cache.interface';

@Injectable()
export class CacheService {

  private cacheProvider: CacheProvider;

  public constructor(
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
  public buildCacheKey(): string {
    const method = this.contextService.getRequestMethod();
    const path = this.contextService.getRequest().url.split('?')[0];
    const query = this.contextService.getRequestQuery();
    const sortedQueryObject = Object.fromEntries(Object.entries(query || { }).sort());
    const sortedQuery = new URLSearchParams(sortedQueryObject).toString();
    return `${method}:${path}${sortedQuery ? `:${sortedQuery}` : ''}`;
  }

  /**
   * Acquire cached data for current request, for any route decorated
   * with `@Cache()` this method will be automatically called before
   * the request reaches the controller.
   */
  public async getCache<T>(): Promise<T> {
    const key = this.buildCacheKey();
    return this.cacheProvider.get<T>(`cache:data:${key}`);
  }

  /**
   * Sets cached data for current request, for any route decorated
   * with `@Cache()` this method will be automatically called before
   * the response is sent to client.
   * @param value
   * @param options
   */
  public async setCache(value: any, options: CacheTtlOptions = { }): Promise<void> {
    const key = this.buildCacheKey();
    await this.cacheProvider.set(`cache:data:${key}`, value, options);
  }

  /**
   * Asynchronously ties current context to target buckets.
   * @param buckets
   * @param options
   */
  public setBucketsAsync(buckets: string[], options: CacheBucketOptions = { }): void {
    void this.setBuckets(buckets, options);
  }

  /**
   * Ties current context to target buckets.
   * @param buckets
   * @param options
   */
  public async setBuckets(buckets: string[], options: CacheBucketOptions = { }): Promise<void> {
    const { ttl, limit } = options;

    try {
      await this.promiseService.resolveLimited({
        data: buckets,
        limit: limit || 100,
        promise: async (b) => {
          const key = this.buildCacheKey();
          await this.cacheProvider.sadd(`cache:bucket:${b}`, `cache:data:${key}`, { ttl });
        },
      });
    }
    catch (e) {
      this.logService.error('failed to set cache buckets', e as Error, buckets);
    }
  }

}
