export interface CacheOptions {
  /** Time to live in milliseconds. */
  ttl?: number;
  /** Related buckets which invalidates target cache. */
  buckets?: string[];
}

export interface CacheProvider {
  getCache: (key: string) => any;
  setCache: (key: string, data: any, options: CacheOptions) => void;
}
