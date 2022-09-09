import { Injectable, InternalServerErrorException } from '@nestjs/common';

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
   * Set add is not supported when using memory.
   */
  public sadd(): void {
    throw new InternalServerErrorException('memory service does not support cache buckets');
  }

}
