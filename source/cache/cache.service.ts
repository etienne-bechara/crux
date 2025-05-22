import { Inject, Injectable, InternalServerErrorException, forwardRef } from '@nestjs/common';
import { compress, uncompress } from 'snappyjs';

import { AppConfig } from '../app/app.config';
import { AppTraffic } from '../app/app.enum';
import { ContextService } from '../context/context.service';
import { LogService } from '../log/log.service';
import { MemoryService } from '../memory/memory.service';
import { PromiseService } from '../promise/promise.service';
import { RedisService } from '../redis/redis.service';
import { CacheGetParams, CacheProvider, CacheSetParams } from './cache.interface';

@Injectable()
export class CacheService {
	private cacheProvider!: CacheProvider;
	private failureCount = 0;
	private failureStart?: number;

	public constructor(
		private readonly appConfig: AppConfig,
		private readonly contextService: ContextService,
		private readonly logService: LogService,
		private readonly memoryService: MemoryService,
		@Inject(forwardRef(() => PromiseService))
		private readonly promiseService: PromiseService,
		@Inject(forwardRef(() => RedisService))
		private readonly redisService: RedisService,
	) {
		this.setupProvider();
	}

	/**
	 * Configures the cache provider, memory will be used
	 * unless a Redis connection is provided.
	 */
	private setupProvider(): void {
		this.cacheProvider = this.redisService.isInitialized() ? this.redisService : this.memoryService;
	}

	/**
	 * Acquires the underlying chosen cache provider.
	 */
	public getProvider(): CacheProvider {
		return this.cacheProvider;
	}

	/**
	 * Acquires the underlying memory cache provider.
	 */
	public getMemory(): MemoryService {
		return this.memoryService;
	}

	/**
	 * Acquires the underlying redis cache provider.
	 */
	public getRedis(): RedisService {
		return this.redisService;
	}

	/**
	 * Builds caching key for current request.
	 * @param params
	 */
	private buildCacheDataKey(params: CacheGetParams = {}): string {
		const { traffic: baseTraffic, host: baseHost, method: baseMethod, path: basePath, query: baseQuery } = params;
		const traffic = baseTraffic || AppTraffic.INBOUND;

		const host = traffic === AppTraffic.INBOUND ? this.contextService.getRequestHost() : baseHost;

		const method = traffic === AppTraffic.INBOUND ? this.contextService.getRequestMethod() : baseMethod;

		const path = traffic === AppTraffic.INBOUND ? this.contextService.getRequest().url.split('?')[0] : basePath;

		const query = traffic === AppTraffic.INBOUND ? this.contextService.getRequestQuery() : baseQuery;

		const sortedQueryObject = Object.fromEntries(Object.entries(query || {}).sort());
		const sortedQuery = new URLSearchParams(sortedQueryObject).toString();

		return `cache:${traffic}:${host}:${method}:${path}${sortedQuery ? `:${sortedQuery}` : ''}`;
	}

	/**
	 * Builds caching key for target bucket.
	 * @param bucket
	 */
	private buildCacheBucketKey(bucket: string): string {
		return `cache:bucket:${bucket}`;
	}

	/**
	 * Attempt to acquire cached data.
	 *
	 * In the event of a failure, blocks reading from cache for
	 * 10 times the timeout to prevent a burst decompression which
	 * might lead to a memory crash.
	 * @param params
	 */
	public async getCache<T>(params: CacheGetParams = {}): Promise<T> {
		const { failureThreshold, failureTtl } = this.appConfig.APP_OPTIONS.cache || {};
		const { timeout } = params;
		let data: T;

		try {
			if (this.failureStart && Date.now() > this.failureStart + failureTtl) {
				this.failureCount = 0;
				this.failureStart = undefined;
			}

			if (this.failureCount > failureThreshold) {
				throw new Error('cache service is offline');
			}

			data = await this.promiseService.resolveOrTimeout({
				promise: () => this.getCacheHandler(params),
				timeout,
			});
		} catch (e: unknown) {
			this.failureStart ??= Date.now();
			this.failureCount++;

			throw new InternalServerErrorException({
				message: `failed to acquire cached data | ${(e as Error).message}`,
				params,
			});
		}

		return data;
	}

	/**
	 * Acquire cached data for current request, for any route decorated
	 * with `@Cache()` this method will be automatically called before
	 * the request reaches the controller.
	 * @param params
	 */
	private async getCacheHandler<T>(params: CacheGetParams = {}): Promise<T> {
		const { compression } = this.appConfig.APP_OPTIONS.cache || {};
		const dataKey = this.buildCacheDataKey(params);

		let value: any = compression ? await this.cacheProvider.getBuffer(dataKey) : await this.cacheProvider.get(dataKey);

		if (value && compression) {
			const uncompressed: Buffer = uncompress(value);
			value = JSON.parse(uncompressed.toString());
		}

		return value;
	}

	/**
	 * Asynchronously sets cached data for current request, for any route
	 * decorated with `@Cache()` this method will be automatically called\
	 * before the response is sent to client.
	 * @param value
	 * @param params
	 */
	public setCache(value: any, params: CacheSetParams = {}): void {
		void this.setCacheHandler(value, params);
	}

	/**
	 * Handler of setCache().
	 * @param value
	 * @param params
	 */
	private async setCacheHandler(value: any, params: CacheSetParams = {}): Promise<void> {
		const { ttl, ...getParams } = params;
		const { compression } = this.appConfig.APP_OPTIONS.cache || {};
		const dataKey = this.buildCacheDataKey(getParams);
		let data = value;

		try {
			if (compression) {
				data = compress(Buffer.from(JSON.stringify(value)));
			}

			await this.cacheProvider.set(dataKey, data, { ttl });
		} catch (e) {
			this.logService.error('Failed to set cache data', e as Error, { data });
		}
	}

	/**
	 * Asynchronously ties cached data for current request with
	 * target buckets which can be individually invalidated.
	 * @param buckets
	 * @param params
	 */
	public setBuckets(buckets: string[], params: CacheGetParams = {}): void {
		void this.setBucketsHandler(buckets, params);
	}

	/**
	 * Handler of setBuckets().
	 * @param buckets
	 * @param params
	 */
	private async setBucketsHandler(buckets: string[], params: CacheGetParams = {}): Promise<void> {
		const { bucketTtl: ttl } = this.appConfig.APP_OPTIONS.cache || {};

		try {
			await this.promiseService.resolveLimited({
				data: buckets,
				limit: 1000,
				promise: async (b) => {
					const bucketKey = this.buildCacheBucketKey(b);
					const dataKey = this.buildCacheDataKey(params);
					await this.cacheProvider.sadd(bucketKey, dataKey, { ttl });
				},
			});
		} catch (e) {
			this.logService.error('Failed to set cache buckets', e as Error, { buckets });
		}
	}

	/**
	 * Asynchronously invalidate target buckets which deletes
	 * their related cache data keys.
	 * @param buckets
	 */
	public invalidateBuckets(buckets: string[]): void {
		void this.invalidateBucketsHandler(buckets);
	}

	/**
	 * Asynchronously invalidate target buckets which deletes
	 * their related cache data keys.
	 * @param buckets
	 */
	private async invalidateBucketsHandler(buckets: string[]): Promise<void> {
		const delPromises: Promise<void>[] = [];

		try {
			await this.promiseService.resolveLimited({
				data: buckets,
				limit: 1000,
				promise: async (b) => {
					const bucketKey = this.buildCacheBucketKey(b);
					const dataSet = await this.cacheProvider.smembers(bucketKey);
					delPromises.push(this.cacheProvider.del(bucketKey) as Promise<void>);

					for (const dataKey of dataSet) {
						delPromises.push(this.cacheProvider.del(dataKey) as Promise<void>);
					}
				},
			});

			await Promise.all(delPromises);
		} catch (e) {
			this.logService.error('Failed to invalidate cache buckets', e as Error, { buckets });
		}
	}
}
