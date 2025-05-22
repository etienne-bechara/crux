import { CallHandler, ExecutionContext, HttpException, HttpStatus, Injectable, NestInterceptor } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { Observable } from 'rxjs';

import { AppMetadataKey } from '../app/app.enum';
import { CacheService } from '../cache/cache.service';
import { ContextService } from '../context/context.service';
import { RateLimitOptions } from './rate.interface';

@Injectable()
export class RateInterceptor implements NestInterceptor {
	public constructor(
		private readonly cacheService: CacheService,
		private readonly contextService: ContextService,
		private readonly reflector: Reflector,
	) {}

	/**
	 * Add tracing and response body validation support.
	 * @param context
	 * @param next
	 */
	public async intercept(context: ExecutionContext, next: CallHandler): Promise<Observable<any>> {
		const options: RateLimitOptions = this.reflector.get(AppMetadataKey.RATE_LIMIT_OPTIONS, context.getHandler());
		const { limit: optionsLimit, key: optionsKey, window: optionsWindow } = options || {};

		const limit = typeof optionsLimit === 'function' ? optionsLimit(this.contextService) : optionsLimit;

		const key =
			typeof optionsKey === 'function'
				? optionsKey(this.contextService)
				: optionsKey || this.contextService.getRequestIp();

		const window =
			typeof optionsWindow === 'function' ? optionsWindow(this.contextService) : optionsWindow || 60 * 1000;

		if (limit) {
			const rateKey = `rate:${key}`;
			const provider = this.cacheService.getProvider();
			const current = await provider.incrbyfloat(rateKey, 1, { ttl: window });

			if (current > limit) {
				const ttl = await provider.ttl(rateKey);

				throw new HttpException(
					{
						message: 'rate limit exceeded',
						limit,
						ttl,
					},
					HttpStatus.TOO_MANY_REQUESTS,
				);
			}
		}

		return next.handle();
	}
}
