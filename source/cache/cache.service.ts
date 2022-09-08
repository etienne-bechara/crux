import { Injectable } from '@nestjs/common';

import { ContextService } from '../context/context.service';
import { LogService } from '../log/log.service';
import { MemoryService } from '../memory/memory.service';
import { CacheProvider, CacheRouteOptions } from './cache.interface';

@Injectable()
export class CacheService {

  private cacheProvider: CacheProvider;

  public constructor(
    private readonly contextService: ContextService,
    private readonly logService: LogService,
    private readonly memoryService: MemoryService,
    // private readonly redisService: RedisService,
  ) {
    this.setupProvider();
  }

  /**
   * Configures the cache provider, memory will be used
   * unless a Redis connection is provided.
   */
  private setupProvider(): void {
    this.cacheProvider = this.memoryService;
  }

  /**
   * Builds caching key for current request.
   */
  public buildCacheKey(): string {
    const method = this.contextService.getRequestMethod();
    const path = this.contextService.getRequestPath();
    const query = this.contextService.getRequestQuery();
    const sortedQueryObject = Object.fromEntries(Object.entries(query || { }).sort());
    const sortedQuery = new URLSearchParams(sortedQueryObject).toString();
    return `CACHE_DATA_${method}_${path}${sortedQuery}`;
  }

  /**
   * Acquire cache data from current provider.
   */
  public getCache(): any {
    const cacheKey = this.buildCacheKey();
    this.logService.debug(`Reading cache ${cacheKey}`);

    return this.cacheProvider.get(cacheKey);
  }

  /**
   * Creates cache data at current provider.
   * @param value
   * @param options
   */
  public setCache(value: any, options: CacheRouteOptions = { }): void {
    const cacheKey = this.buildCacheKey();
    this.logService.debug(`Setting cache ${cacheKey}`);

    this.cacheProvider.set(cacheKey, value, options);
  }

}
