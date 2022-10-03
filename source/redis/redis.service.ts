import { Inject, Injectable, InternalServerErrorException, Scope } from '@nestjs/common';
import Redis from 'ioredis';
import { v4 } from 'uuid';

import { CacheProvider } from '../cache/cache.interface';
import { LogService } from '../log/log.service';
import { PromiseService } from '../promise/promise.service';
import { TraceService } from '../trace/trace.service';
import { RedisInjectionToken } from './redis.enum';
import { RedisLockOptions, RedisModuleOptions, RedisSetOptions, RedisTtlOptions } from './redis.interface';

@Injectable({ scope: Scope.TRANSIENT })
export class RedisService implements CacheProvider {

  private redisClient: Redis;
  private initialized: boolean;

  public constructor(
    @Inject(RedisInjectionToken.REDIS_MODULE_OPTIONS)
    private readonly redisModuleOptions: RedisModuleOptions,
    private readonly logService: LogService,
    private readonly promiseService: PromiseService,
  ) {
    this.setupClient();
  }

  /**
   * Sets up the redis cloud client, use lazy connection
   * in order to allow capturing failures.
   */
  private setupClient(): void {
    if (!this.redisModuleOptions?.host) {
      this.logService.warning('Redis connection disabled due to missing host');
      return;
    }

    this.redisModuleOptions.defaultTtl ??= 60_000;
    this.redisModuleOptions.enableAutoPipelining ??= true;
    this.redisModuleOptions.lazyConnect = true;
    this.redisModuleOptions.keepAlive ??= 1000;

    // On connection failure: attempt to reconnect after delay
    this.redisModuleOptions.retryStrategy = (times: number): number | void => {
      const retryDelay = Math.min(times * 1000, 60_000);

      if (times > 2) {
        this.logService.error('Redis connection failed', { retryDelay });
      }

      return retryDelay;
    };

    // On error: logs error message and resend failed command
    this.redisModuleOptions.reconnectOnError = (err: Error): boolean | 1 | 2 => {
      this.logService.error(`${err.message}`, err);
      return 2;
    };

    this.redisClient = new Redis(this.redisModuleOptions);

    this.redisClient.on('connect', () => {
      this.logService.info(`Redis connected at ${this.redisModuleOptions.host}`);
    });

    this.initialized = true;
    void this.redisClient.connect();
  }

  /**
   * Returns whether or not the client has been initialized.
   */
  public isInitialized(): boolean {
    return this.initialized;
  }

  /**
   * Returns the underlying client.
   */
  public getClient(): Redis {
    if (!this.isInitialized()) {
      throw new InternalServerErrorException('Redis client unavailable');
    }

    return this.redisClient;
  }

  /**
   * Expire target key after configured time in milliseconds.
   * @param key
   * @param ttl
   */
  public expire(key: string, ttl: number): Promise<void> {
    return TraceService.startManagedSpan(`Redis | EXPIRE ${key}`, { }, async () => {
      this.logService.trace(`EXPIRE ${key} ${ttl}`);
      await this.getClient().expire(key, ttl / 1000);
    });
  }

  /**
   * Reads given key and parse its value.
   * @param key
   */
  public get<T>(key: string): Promise<T> {
    return TraceService.startManagedSpan(`Redis | GET ${key}`, { }, async () => {
      this.logService.trace(`GET ${key}`);
      const value = await this.getClient().get(key);
      return JSON.parse(value);
    });
  }

  /**
   * Reads given key as buffer.
   * @param key
   */
  public getBuffer(key: string): Promise<Buffer> {
    return TraceService.startManagedSpan(`Redis | GET ${key}`, { }, async () => {
      this.logService.trace(`GET ${key}`);
      return this.getClient().getBuffer(key);
    });
  }

  /**
   * Sets key with target data, stringifies it in order to preserve type information.
   * @param key
   * @param value
   * @param options
   */
  public set<T>(key: string, value: any, options: RedisSetOptions = { }): Promise<T> {
    return TraceService.startManagedSpan(`Redis | SET ${key}`, { }, async () => {
      this.logService.trace(`SET ${key}`);
      options.ttl ??= this.redisModuleOptions.defaultTtl;

      const { skip, get, keepTtl, ttl } = options;
      const data = Buffer.isBuffer(value) ? value : JSON.stringify(value);
      const extraParams: string[] = [ ];

      if (skip === 'IF_EXIST') {
        extraParams.push('NX');
      }
      else if (skip === 'IF_NOT_EXIST') {
        extraParams.push('XX');
      }

      if (keepTtl) {
        extraParams.push('KEEPTTL');
      }
      else if (ttl) {
        extraParams.push('PX', ttl.toString());
      }

      // eslint-disable-next-line @typescript-eslint/no-unsafe-argument
      await this.getClient().set(key, data, ...extraParams as any);
      return get ? this.get(key) : undefined;
    });
  }

  /**
   * Deletes desired key.
   * @param key
   */
  public del(key: string): Promise<void> {
    return TraceService.startManagedSpan(`Redis | DEL ${key}`, { }, async () => {
      this.logService.trace(`DEL ${key}`);
      await this.getClient().del(key);
    });
  }

  /**
   * Increments a key and return its current value.
   * If it does not exist create it with given ttl.
   * @param key
   * @param amount
   * @param options
   */
  public incrbyfloat(key: string, amount: number = 1, options: RedisTtlOptions = { }): Promise<number> {
    return TraceService.startManagedSpan(`Redis | INCRBYFLOAT ${key}`, { }, async () => {
      this.logService.trace(`INCRBYFLOAT ${key} ${amount >= 0 ? '+' : ''}${amount}`);
      options.ttl ??= this.redisModuleOptions.defaultTtl;

      const stringValue = await this.getClient().incrbyfloat(key, amount);
      const numberValue = Number.parseFloat(stringValue);

      if (numberValue === amount) {
        await this.expire(key, options.ttl);
      }

      return numberValue;
    });
  }

  /**
   * Reads all values from target set.
   * @param key
   */
  public smembers(key: string): Promise<string[]> {
    return TraceService.startManagedSpan(`Redis | SMEMBERS ${key}`, { }, async () => {
      this.logService.trace(`SMEMBERS ${key}`);
      return this.getClient().smembers(key);
    });
  }

  /**
   * Adds a value to target key set.
   * @param key
   * @param value
   * @param options
   */
  public sadd(key: string, value: string, options: RedisTtlOptions = { }): Promise<void> {
    return TraceService.startManagedSpan(`Redis | SADD ${key}`, { }, async () => {
      this.logService.trace(`SADD ${key} ${value}`);
      options.ttl ??= this.redisModuleOptions.defaultTtl;

      const setLength = await this.getClient().sadd(key, value);

      if (setLength === 1) {
        await this.expire(key, options.ttl);
      }
    });
  }

  /**
   * Implements distributed lock strategy based on NX option from SET,
   * as recommend by their documentation:
   * https://redis.io/docs/reference/patterns/distributed-locks/.
   * @param key
   * @param options
   */
  public async lock(key: string, options: RedisLockOptions = { }): Promise<void> {
    options.ttl ??= this.redisModuleOptions.defaultTtl;
    options.timeout ??= this.redisModuleOptions.defaultTtl;
    options.delay ??= 500;

    const { ttl, delay, timeout, retries } = options;
    const lockKey = `lock:${key}`;
    const lockValue = v4();

    await this.promiseService.retryOnRejection({
      name: 'lock()',
      delay,
      retries,
      timeout,
      promise: async () => {
        const currentValue = await this.set(lockKey, lockValue, { ttl, get: true, skip: 'IF_EXIST' });

        if (currentValue !== lockValue) {
          throw new InternalServerErrorException({
            message: `Failed to lock key ${key}`,
            options,
          });
        }
      },
    });
  }

  /**
   * Removes the pseudo key used by lock.
   * @param key
   */
  public async unlock(key: string): Promise<void> {
    this.logService.trace(`UNLOCK ${key}`);
    return this.del(`lock:${key}`);
  }

}
