import { Injectable } from '@nestjs/common';

import { MemoryOptions } from './memory.interface';

@Injectable()
export class MemoryService<DataKey = Record<string, any>> {

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
  public del<K extends keyof DataKey>(key: K): void {
    this.memoryData.delete(key as string);
    this.memoryExpiration.delete(key as string);
  }

}
