import { Injectable } from '@nestjs/common';

import { StorageOptions } from './storage.interface';

@Injectable()
export class StorageService<DataKey = Record<string, any>> {

  private storageData = new Map<string, any>();
  private storageExp = new Map<string, number>();

  /**
   * Reads data from target storage key, if a TTL is set and expired removes the key.
   * @param key
   */
  public getKey<K extends keyof DataKey>(key: K): DataKey[K] {
    const ttl = this.storageExp.get(key as string);
    const isExpired = ttl && Date.now() > ttl;

    if (isExpired) {
      this.storageData.delete(key as string);
      this.storageExp.delete(key as string);
    }

    return this.storageData.get(key as string);
  }

  /**
   * Sets data to target storage key, optionally add a TTL.
   * @param key
   * @param value
   * @param options
   */
  public setKey<K extends keyof DataKey>(key: K, value: DataKey[K], options: StorageOptions = { }): void {
    const { ttl } = options;
    this.storageData.set(key as string, value);

    if (ttl) {
      this.storageExp.set(key as string, Date.now() + ttl);
    }
  }

  /**
   * Removes target data and TTL from key.
   * @param key
   */
  public delKey<K extends keyof DataKey>(key: K): void {
    this.storageData.delete(key as string);
    this.storageExp.delete(key as string);
  }

}
