import { ModuleMetadata } from '@nestjs/common';
import { RedisOptions } from 'ioredis';

export interface RedisAsyncModuleOptions extends Pick<ModuleMetadata, 'imports'> {
  inject?: any[];
  useFactory: (...args: any[]) => Promise<RedisModuleOptions> | RedisModuleOptions;
}

export interface RedisModuleOptions extends Omit<RedisOptions, 'keepAlive'> {
  /** Default TTL when using wrapped commands, does not direct commands through `.getClient()`. Default: 60s. */
  defaultTtl?: number;
  /** Keep alive delay. */
  keepAlive?: number;
}

export interface RedisTtlOptions {
  /** Key time to live in milliseconds. Default: Fallback to `defaultTtl`. */
  ttl?: number;
}

export interface RedisLockOptions extends RedisTtlOptions {
  /** Delay between each retry. Default: 500ms. */
  delay?: number;
  /** Time in milliseconds to keep retrying. Default: Fallback to `defaultTtl`. */
  timeout?: number;
  /** Maximum amount of retries. Default: Infinity. */
  retries?: number;
}

export interface RedisSetOptions extends RedisTtlOptions {
  /** Includes NX or XX option to Redis command. */
  skip?: 'IF_EXIST' | 'IF_NOT_EXIST';
  /** Includes GET to Redis command. */
  get?: boolean;
  /** Includes KEEPTTL to Redis command. */
  keepTtl?: boolean;
}
