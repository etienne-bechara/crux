import { Injectable } from '@nestjs/common';

import { CacheOptions, CacheProvider } from '../cache/cache.interface';
import { MemoryOptions } from './memory.interface';

@Injectable()
export class MemoryService<DataKey = Record<string, any>> implements CacheProvider {

  private memoryData = new Map<string, any>();
  private memoryExpiration = new Map<string, number>();

  /**
   * Reads data from target storage key, if a TTL is set and expired removes the key.
   * @param key
   */
  public get<K extends keyof DataKey>(key: K): DataKey[K] {
    const ttl = this.memoryExpiration.get(key as string);
    const isExpired = ttl && Date.now() > ttl;

    if (isExpired) {
      this.memoryData.delete(key as string);
      this.memoryExpiration.delete(key as string);
    }

    return this.memoryData.get(key as string);
  }

  /**
   * Sets data to target storage key, optionally add a TTL.
   * @param key
   * @param value
   * @param options
   */
  public set<K extends keyof DataKey>(key: K, value: DataKey[K], options: MemoryOptions = { }): void {
    const { ttl } = options;
    this.memoryData.set(key as string, value);

    if (ttl) {
      const currentExp = this.memoryExpiration.get(key as string);

      if (!currentExp) {
        this.memoryExpiration.set(key as string, Date.now() + ttl);
      }
    }
  }

  /**
   * Removes target data and TTL from key.
   * @param key
   */
  public delete<K extends keyof DataKey>(key: K): void {
    this.memoryData.delete(key as string);
    this.memoryExpiration.delete(key as string);
  }

  /**
   * Acquire data from a cached key.
   * @param key
   */
  public getCache(key: string): any {
    return this.get(key as any);
  }

  /**
   * Creates cache for target key.
   * @param key
   * @param data
   * @param options
   */
  public setCache(key: string, data: any, options: CacheOptions): void {
    const { ttl } = options;
    // eslint-disable-next-line @typescript-eslint/no-unsafe-argument
    this.set(key as any, data, { ttl });
  }

}
