import { Injectable } from '@nestjs/common';

import { AppRequest, AppResponse } from '../app/app.interface';
import { ContextStorageKey } from './context.enum';
import { ContextJwtPayload } from './context.interface';
import { ContextStorage } from './context.storage';

@Injectable()
export class ContextService<Metadata = Record<string, any>> {

  /**
   * Returns local store for current context.
   */
  public getStore(): Map<string, any> {
    return ContextStorage.getStore();
  }

  /**
   * Returns the inbound request.
   */
  public getRequest(): AppRequest {
    return this.getStore().get(ContextStorageKey.REQUEST);
  }

  /**
   * Returns the inbound request.
   */
  public getResponse(): AppResponse {
    return this.getStore().get(ContextStorageKey.RESPONSE);
  }

  /**
   * Reads a metadata key bound to current request lifecycle.
   * @param key
   */
  public getMetadata<K extends keyof Metadata>(key: K): Metadata[K] {
    const metadata: Metadata = this.getStore().get(ContextStorageKey.METADATA) || { };
    return metadata[key];
  }

  /**
   * Create or update a metadata key bound to current request lifecycle.
   * @param key
   * @param value
   */
  public setMetadata<K extends keyof Metadata>(key: K, value: Metadata[K]): void {
    const metadata: Metadata = this.getStore().get(ContextStorageKey.METADATA) || { };
    metadata[key] = value;
    this.getStore().set(ContextStorageKey.METADATA, metadata);
  }

  /**
   * Returns true client IP.
   */
  public getClientIp(): string {
    const req = this.getRequest();
    return req.ips?.[req.ips.length - 1] || req.ip;
  }

  /**
   * Acquire authorization header and decode its payload if applicable.
   */
  public getJwtPayload(): ContextJwtPayload {
    const token: string = this.getRequest().headers.authorization;
    return this.decodeJwtPayload(token);
  }

  /**
   * Decodes and returns target token payload.
   * @param token
   */
  private decodeJwtPayload(token: string): ContextJwtPayload {
    const payload: string = token?.split('.')?.[1];
    if (!payload) return;

    let decoded: ContextJwtPayload;

    try {
      decoded = JSON.parse(Buffer.from(payload, 'base64').toString('utf8'));
    }
    catch {
      /* Falls through, since payload is invalid it should return undefined */
    }

    decoded.app_metadata ??= { };
    decoded.user_metadata ??= { };

    for (const key in decoded) {
      if (key.includes('app_metadata')) {
        decoded.app_metadata = { ...decoded.app_metadata, ...decoded[key] };
      }
      else if (key.includes('user_metadata')) {
        decoded.user_metadata = { ...decoded.user_metadata, ...decoded[key] };
      }
    }

    return decoded;
  }

}
