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
		const provider = this.cacheService.getProvider();

		const { limit: optLimit, key: optKey, window: optWindow } = options || {};

		if (!optLimit) {
			return next.handle();
		}

		const ip = this.contextService.getRequestIp();
		const method = this.contextService.getRequestMethod();
		const path = this.contextService.getRequestPath();

		const baseKey = `${ip}:${method}:${path}`;
		const baseWindow = 60 * 1000;

		const limit = typeof optLimit === 'function' ? optLimit(this.contextService) : optLimit;
		const key = typeof optKey === 'function' ? optKey(this.contextService) : optKey || baseKey;
		const window = typeof optWindow === 'function' ? optWindow(this.contextService) : optWindow || baseWindow;

		const rateKey = `rate:${key}`;
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

		return next.handle();
	}
}
