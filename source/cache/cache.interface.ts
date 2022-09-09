export interface CacheTtlOptions {
  /** Time to live in milliseconds. */
  ttl?: number;
}

export type CacheRouteOptions = CacheTtlOptions;

export interface CacheBucketOptions extends CacheTtlOptions {
  /** Concurrency limit when asynchronously persisting bucket keys. Default: 100. */
  limit?: number;
}

export interface CacheOptions {
  /** Disables gzip compression when storing cached data. */
  disableCompression?: boolean;
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
  get: <T>(key: string) => T | Promise<T>;
  getBuffer: (key: string) => Buffer | Promise<Buffer>;
  set: (key: string, value: any, options?: CacheTtlOptions) => void | Promise<void>;
  sadd: (key: string, value: string, options?: CacheTtlOptions) => void | Promise<void>;
}
