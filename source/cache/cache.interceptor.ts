import { CallHandler, ExecutionContext, Injectable, NestInterceptor } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { mergeMap, Observable, of } from 'rxjs';

import { ContextService } from '../context/context.service';
import { LogService } from '../log/log.service';
import { CacheReflector, CacheStatus } from './cache.enum';
import { CacheRouteOptions } from './cache.interface';
import { CacheService } from './cache.service';

@Injectable()
export class CacheInterceptor implements NestInterceptor {

  public constructor(
    private readonly cacheService: CacheService,
    private readonly contextService: ContextService,
    private readonly logService: LogService,
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
    const cache = await this.cacheService.getCache();
    const options: CacheRouteOptions = this.reflector.get(CacheReflector.CACHE_OPTIONS, context.getHandler());

    if (cache) {
      this.logService.debug('Resolving with cached data');
      this.contextService.setCacheStatus(CacheStatus.HIT);
      return of(cache);
    }

    return next
      .handle()
      .pipe(
        mergeMap(async (data) => {
          this.contextService.setCacheStatus(CacheStatus.MISS);
          await this.cacheService.setCache(data, options);
          return data;
        }),
      );
  }

}
