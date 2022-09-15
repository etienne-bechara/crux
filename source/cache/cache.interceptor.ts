import { CallHandler, ExecutionContext, Injectable, NestInterceptor } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { mergeMap, Observable, of } from 'rxjs';

import { AppConfig } from '../app/app.config';
import { ContextService } from '../context/context.service';
import { LogService } from '../log/log.service';
import { PromiseService } from '../promise/promise.service';
import { CacheReflector, CacheStatus } from './cache.enum';
import { CacheInterceptParams, CacheRouteOptions } from './cache.interface';
import { CacheService } from './cache.service';

@Injectable()
export class CacheInterceptor implements NestInterceptor {

  public constructor(
    private readonly appConfig: AppConfig,
    private readonly cacheService: CacheService,
    private readonly contextService: ContextService,
    private readonly logService: LogService,
    private readonly promiseService: PromiseService,
    private readonly reflector: Reflector,
  ) { }

  /**
   * Attempt to acquire cached data, if present, resolve with it
   * before proceeding to controller.
   *
   * If not, acquire data from controller and then persist it.
   * @param context
   * @param next
   */
  public async intercept(context: ExecutionContext, next: CallHandler): Promise<Observable<any>> {
    const { enabled, timeout, buckets, invalidate, ttl } = this.buildCacheInterceptParams(context);
    const req = this.contextService.getRequest();
    let cache: unknown;

    if (enabled) {
      try {
        cache = await this.promiseService.resolveOrTimeout(this.cacheService.getCache(), timeout);
      }
      catch {
        this.logService.warning('Failed to acquire cached data within timeout', { timeout });
      }

      if (cache) {
        this.logService.debug('Resolving with cached data');
        this.contextService.setCacheStatus(CacheStatus.HIT);
        return of(cache);
      }
    }

    return next
      .handle()
      .pipe(
        // eslint-disable-next-line @typescript-eslint/require-await
        mergeMap(async (data) => {
          if (invalidate) {
            this.cacheService.invalidateBuckets(invalidate(req, data));
          }

          if (buckets) {
            this.cacheService.setBuckets(buckets(req, data));
          }

          if (enabled) {
            this.contextService.setCacheStatus(CacheStatus.MISS);
            this.cacheService.setCache(data, { ttl });
          }

          return data;
        }),
      );
  }

  /**
   * Build cache interception params by merging route options with
   * application level.
   * @param context
   */
  private buildCacheInterceptParams(context: ExecutionContext): CacheInterceptParams {
    const method = this.contextService.getRequestMethod();

    const options: CacheRouteOptions = this.reflector.get(CacheReflector.CACHE_OPTIONS, context.getHandler());
    const { enabled: routeEnabled, timeout: routeTimeout, ttl: routeTtl, buckets, invalidate } = options;

    const enabled = routeEnabled ?? [ 'GET', 'HEAD' ].includes(method);
    const timeout = routeTimeout || this.appConfig.APP_OPTIONS.cache?.defaultTimeout;
    const ttl = routeTtl || this.appConfig.APP_OPTIONS.cache?.defaultTtl;

    return { enabled, timeout, buckets, invalidate, ttl };
  }

}
