import { CallHandler, ExecutionContext, Injectable, NestInterceptor } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { Observable, mergeMap, of } from 'rxjs';

import { AppConfig } from '../app/app.config';
import { AppMetadataKey } from '../app/app.enum';
import { ContextService } from '../context/context.service';
import { LogService } from '../log/log.service';
import { CacheStatus } from './cache.enum';
import { CacheInterceptParams, CacheRouteOptions } from './cache.interface';
import { CacheService } from './cache.service';

@Injectable()
export class CacheInterceptor implements NestInterceptor {
  public constructor(
    private readonly appConfig: AppConfig,
    private readonly cacheService: CacheService,
    private readonly contextService: ContextService,
    private readonly logService: LogService,
    private readonly reflector: Reflector,
  ) {}

  /**
   * Attempt to acquire cached data, if present, resolve with it
   * before proceeding to controller.
   *
   * If not, acquire data from controller and then persist it.
   * @param context
   * @param next
   */
  public async intercept(context: ExecutionContext, next: CallHandler): Promise<Observable<any>> {
    const params = this.buildCacheInterceptParams(context);
    const { enabled, timeout } = params;
    let cache: unknown;

    if (enabled) {
      try {
        cache = await this.cacheService.getCache({ timeout });
      } catch (e) {
        this.logService.warning('Failed to acquire inbound cached data', e as Error);
      }

      if (cache) {
        this.logService.debug('Resolving inbound request with cached data');
        this.contextService.setCacheStatus(CacheStatus.HIT);
        return of(cache);
      }
    }

    return next.handle().pipe(mergeMap(async (data) => this.handleOutputData(data, params)));
  }

  /**
   * Build cache interception params by merging route options with
   * application level.
   * @param context
   */
  private buildCacheInterceptParams(context: ExecutionContext): CacheInterceptParams {
    const method = this.contextService.getRequestMethod();

    const options: CacheRouteOptions = this.reflector.get(AppMetadataKey.CACHE_OPTIONS, context.getHandler());
    const { enabled: routeEnabled, timeout: routeTimeout, ttl: routeTtl, buckets, invalidate } = options;

    const enabled = routeEnabled ?? ['GET', 'HEAD'].includes(method);
    const timeout = routeTimeout || this.appConfig.APP_OPTIONS.cache?.defaultTimeout;
    const ttl = routeTtl || this.appConfig.APP_OPTIONS.cache?.defaultTtl;

    return { enabled, timeout, buckets, invalidate, ttl };
  }

  /**
   * Given output data, decided whether or not it should be cached,
   * as well as apply any related buckets.
   * @param data
   * @param params
   */
  private handleOutputData(data: unknown, params: CacheInterceptParams): unknown {
    const { enabled, buckets, invalidate, ttl } = params;
    const req = this.contextService.getRequest();

    if (invalidate) {
      this.cacheService.invalidateBuckets(invalidate({ req, data }));
    }

    if (enabled) {
      this.contextService.setCacheStatus(CacheStatus.MISS);

      if (buckets) {
        const bucketValues = buckets({ req, data });

        if (bucketValues?.length > 0) {
          this.cacheService.setBuckets(bucketValues);
          this.cacheService.setCache(data, { ttl });
        }
      } else {
        this.cacheService.setCache(data, { ttl });
      }
    }

    return data;
  }
}
