import { Injectable } from '@nestjs/common';

import { CacheProvider } from '../cache/cache.interface';
import { MemoryOptions } from './memory.interface';

@Injectable()
export class MemoryService implements CacheProvider {

  private memoryData = new Map<string, any>();
  private memoryExpiration = new Map<string, number>();

  /**
   * Reads data from target storage key, if a TTL is set and expired removes the key.
   * @param key
   */
  public get<T>(key: string): T {
    const ttl = this.memoryExpiration.get(key);
    const isExpired = ttl && Date.now() > ttl;

    if (isExpired) {
      this.memoryData.delete(key);
      this.memoryExpiration.delete(key);
    }

    return this.memoryData.get(key);
  }

  /**
   * Reads buffer data from target storage key, if a TTL is set and expired removes the key.
   * @param key
   */
  public getBuffer(key: string): Buffer {
    return this.get(key);
  }

  /**
   * Sets data to target storage key, optionally add a TTL.
   * @param key
   * @param value
   * @param options
   */
  public set(key: string, value: any, options: MemoryOptions = { }): void {
    const { ttl } = options;
    this.memoryData.set(key, value);

    if (ttl) {
      const currentExp = this.memoryExpiration.get(key);

      if (!currentExp) {
        this.memoryExpiration.set(key, Date.now() + ttl);
      }
    }
  }

  /**
   * Removes target data and TTL from key.
   * @param key
   */
  public del(key: string): void {
    this.memoryData.delete(key);
    this.memoryExpiration.delete(key);
  }

  /**
   * Reads all values from target set.
   * @param key
   */
  public smembers(key: string): string[] {
    const set: Set<string> = this.get(key);
    return [ ...set ];
  }

  /**
   * Adds a value to target key set.
   * @param key
   * @param value
   * @param options
   */
  public sadd(key: string, value: string, options: MemoryOptions = { }): void {
    const set: Set<string> = this.get(key);

    if (set) {
      set.add(value);
    }
    else {
      this.set(key, new Set([ value ]), options);
    }
  }

}
