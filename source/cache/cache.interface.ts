export interface CacheRouteOptions {
  /** Time to live in milliseconds. */
  ttl?: number;
  /** Related buckets which invalidates target cache. */
  buckets?: string[];
}

export interface CacheOptions {
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
  get: (key: string) => any;
  set: (key: string, data: any, options: CacheRouteOptions) => void;
}
