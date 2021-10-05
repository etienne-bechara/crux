import { Injectable } from '@nestjs/common';

import { AppRequest, AppResponse } from '../app/app.interface';
import { RequestStorageKey } from './request.enum';
import { RequestStorage } from './request.storage';

@Injectable()
export class RequestService<Metadata = Record<string, any>> {

  /**
   * Returns local store for current context.
   */
  public getStore(): Map<string, any> {
    return RequestStorage.getStore();
  }

  /**
   * Returns the inbound request.
   */
  public getRequest(): AppRequest {
    return this.getStore().get(RequestStorageKey.REQUEST);
  }

  /**
   * Returns the inbound request.
   */
  public getResponse(): AppResponse {
    return this.getStore().get(RequestStorageKey.RESPONSE);
  }

  /**
   * Reads a metadata key bound to current request lifecycle.
   * @param key
   */
  public getMetadata<K extends keyof Metadata>(key: K): Metadata[K] {
    const metadata: Metadata = this.getStore().get(RequestStorageKey.METADATA) || { };
    return metadata[key];
  }

  /**
   * Create or update a metadata key bound to current request lifecycle.
   * @param key
   * @param value
   */
  public setMetadata<K extends keyof Metadata>(key: K, value: Metadata[K]): void {
    const metadata: Metadata = this.getStore().get(RequestStorageKey.METADATA) || { };
    metadata[key] = value;
    this.getStore().set(RequestStorageKey.METADATA, metadata);
  }

  /**
   * Returns true client IP.
   */
  public getClientIp(): string {
    const req = this.getRequest();
    return req.ips?.[req.ips.length - 1] || req.ip;
  }

  /**
   * Decodes and returns authorization payload.
   */
  public getJwtPayload(): Record<string, any> {
    const payload = this.getRequest().headers.authorization?.split('.')?.[1];
    if (!payload) return { };

    try {
      const decoded = JSON.parse(Buffer.from(payload, 'base64').toString('utf8'));
      return decoded;
    }
    catch {
      return { };
    }
  }

}
