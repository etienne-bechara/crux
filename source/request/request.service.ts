import { Injectable } from '@nestjs/common';

import { AppRequest, AppResponse } from '../app/app.interface';
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
    return this.getStore().get('req');
  }

  /**
   * Returns the inbound request.
   */
  public getResponse(): AppResponse {
    return this.getStore().get('res');
  }

  /**
   * Acquires request metadata which works as a typed mutable object per
   * request, that is also included in logging in case of exceptions.
   */
  public getMetadata(): Metadata {
    const req = this.getRequest();
    req.raw.metadata ??= { };
    return req.raw.metadata;
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
