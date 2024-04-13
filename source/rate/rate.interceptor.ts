import { CallHandler, ExecutionContext, HttpException, HttpStatus, Injectable, NestInterceptor } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { Observable } from 'rxjs';

import { AppMetadataKey } from '../app/app.enum';
import { CacheService } from '../cache/cache.service';
import { ContextService } from '../context/context.service';

@Injectable()
export class RateInterceptor implements NestInterceptor {

  public constructor(
    private readonly cacheService: CacheService,
    private readonly contextService: ContextService,
    private readonly reflector: Reflector,
  ) { }

  /**
   * Add tracing and response body validation support.
   * @param context
   * @param next
   */
  public async intercept(context: ExecutionContext, next: CallHandler): Promise<Observable<any>> {
    const limit: number = this.reflector.get(AppMetadataKey.RATE_LIMIT, context.getHandler());
    const window = 60 * 1000;

    if (limit) {
      const key = this.buildRateLimitKey();
      const provider = this.cacheService.getProvider();
      const current = await provider.incrbyfloat(key, 1, { ttl: window });

      if (current > limit) {
        const ttl = await provider.ttl(key);

        throw new HttpException({
          message: 'rate limit exceeded',
          limit,
          ttl,
        }, HttpStatus.TOO_MANY_REQUESTS);
      }
    }

    return next.handle();
  }

  /**
   * Builds a rate limit key by IP.
   */
  private buildRateLimitKey(): string {
    const ip = this.contextService.getRequestIp();
    return `rate:${ip}`;
  }

}
