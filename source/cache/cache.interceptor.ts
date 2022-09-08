import { CallHandler, ExecutionContext, Injectable, NestInterceptor } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { mergeMap, Observable, of } from 'rxjs';

import { ContextService } from '../context/context.service';
import { LogService } from '../log/log.service';
import { CacheReflector, CacheStatus } from './cache.enum';
import { CacheOptions } from './cache.interface';
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
   * X.
   * @param context
   * @param next
   */
  public intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    const cache = this.cacheService.getCache();
    const options: CacheOptions = this.reflector.get(CacheReflector.CACHE_OPTIONS, context.getHandler());

    if (cache) {
      this.logService.debug('Resolving with cached data');
      this.contextService.setCacheStatus(CacheStatus.HIT);
      return of(cache);
    }

    return next
      .handle()
      .pipe(
        // eslint-disable-next-line @typescript-eslint/require-await
        mergeMap(async (data) => {
          this.contextService.setCacheStatus(CacheStatus.MISS);
          this.cacheService.setCache(data, options);
          return data;
        }),
      );
  }

}
