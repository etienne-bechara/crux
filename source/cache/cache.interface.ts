import { AppTraffic } from '../app/app.enum';
import { AppRequest } from '../app/app.interface';

export interface CacheGetParams {
	timeout?: number;
	traffic?: AppTraffic;
	host?: string;
	method?: string;
	path?: string;
	query?: Record<string, any>;
}

export interface CacheSetParams extends CacheGetParams {
	ttl?: number;
}

export interface CacheTtlOptions {
	/** Time to live in milliseconds. */
	ttl?: number;
}

export interface CacheSetOptions extends CacheTtlOptions {
	skip?: 'IF_EXIST' | 'IF_NOT_EXIST';
}

export interface CacheRouteOptions<T = unknown> extends CacheTtlOptions {
	/** Whether or not to enable cache for this route. Default: `true` for `HEAD` and `GET`, `false` otherwise. */
	enabled?: boolean;
	/** Time in milliseconds to await for cache acquisition before processing regularly. */
	timeout?: number;
	/** Which buckets to automatically set based on current request and response data. */
	buckets?: (params: CacheRouteBucketParams<T>) => string[];
	/** Which buckets to immediately invalidate based on current request and response data. */
	invalidate?: (params: CacheRouteBucketParams<T>) => string[];
}

export interface CacheRouteBucketParams<T> {
	req: AppRequest;
	data: T;
}

export interface CacheInterceptParams extends CacheRouteOptions {
	ttl?: number;
}

export interface CacheOptions {
	/** Enables snappy compression when storing cached data. */
	compression?: boolean;
	/** Default cache acquisition timeout in milliseconds when unspecified at controller. Default: 500ms. */
	defaultTimeout: number;
	/** Default TTL in milliseconds when unspecified at controller. Default: 1m. */
	defaultTtl: number;
	/** Bucket TTL in milliseconds. Default: 1d. */
	bucketTtl: number;
	/** Amount of failed read attempts to trigger a failure state. Default: 3. */
	failureThreshold: number;
	/** Duration of a failure state in milliseconds where all attempts to read cached data are ignored. Default: 5s. */
	failureTtl: number;
	/** Redis host to store cached data. Can be overridden by env `CACHE_HOST`. */
	host?: string;
	/** Redis port to store cached data. Can be overridden by env `CACHE_PORT`. */
	port?: number;
	/** Redis username to store cached data. Can be overridden by env `REDIS_USERNAME`. */
	username?: string;
	/** Redis password to store cached data. Can be overridden by env `REDIS_PASSWORD`. */
	password?: string;
}

export interface CacheProvider {
	ttl: (key: string) => number | Promise<number>;
	get: <T>(key: string) => T | Promise<T>;
	getBuffer: (key: string) => Buffer | Promise<Buffer>;
	set: (key: string, value: any, options?: CacheSetOptions) => void | Promise<void>;
	del: (key: string) => void | Promise<void>;
	incrbyfloat(key: string, amount?: number, options?: CacheTtlOptions): number | Promise<number>;
	sadd: (key: string, value: string, options?: CacheTtlOptions) => void | Promise<void>;
	smembers: (key: string) => string[] | Promise<string[]>;
}
