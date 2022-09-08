import { Injectable } from '@nestjs/common';

import { ContextService } from '../context/context.service';
import { LogService } from '../log/log.service';
import { MemoryService } from '../memory/memory.service';
import { RedisService } from '../redis/redis.service';
import { CacheProvider, CacheRouteOptions } from './cache.interface';

@Injectable()
export class CacheService {

  private cacheProvider: CacheProvider;

  public constructor(
    private readonly contextService: ContextService,
    private readonly logService: LogService,
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
   * @param type
   */
  public buildCacheKey(type: 'data' | 'buckets'): string {
    const method = this.contextService.getRequestMethod();
    const path = this.contextService.getRequestPath().replace(/:/g, '');
    const query = this.contextService.getRequestQuery();
    const sortedQueryObject = Object.fromEntries(Object.entries(query || { }).sort());
    const sortedQuery = new URLSearchParams(sortedQueryObject).toString();
    return `cache:${method}:${path}${sortedQuery ? `:${sortedQuery}` : ''}:${type}`;
  }

  /**
   * Acquire cache data from current provider.
   */
  public async getCache<T>(): Promise<T> {
    const cacheKey = this.buildCacheKey('data');
    this.logService.debug(`Reading cache ${cacheKey}`);

    const value = await this.cacheProvider.get<T>(cacheKey);
    return value;
  }

  /**
   * Creates cache data at current provider.
   * @param value
   * @param options
   */
  public async setCache(value: any, options: CacheRouteOptions = { }): Promise<void> {
    const cacheKey = this.buildCacheKey('data');
    this.logService.debug(`Setting cache ${cacheKey}`);

    await this.cacheProvider.set(cacheKey, value, options);
  }

}
