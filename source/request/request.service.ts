import { ArgumentsHost, ExecutionContext, Inject, Injectable, Scope } from '@nestjs/common';
import { REQUEST } from '@nestjs/core';

import { AppRequest } from '../app/app.interface';
import { RequestHttpContext } from './request.interface';

@Injectable({ scope: Scope.REQUEST })
export class RequestService {

  public constructor(
    @Inject(REQUEST)
    private readonly request: AppRequest,
  ) { }

  /**
   * Get http request components from context.
   * @param context
   */
  public static getHttpContext(context: ArgumentsHost | ExecutionContext): RequestHttpContext {
    return {
      req: context.switchToHttp().getRequest(),
      res: context.switchToHttp().getResponse(),
      next: context.switchToHttp().getNext(),
    };
  }

  /**
   * Builds an instance of provider from context,
   * without requiring dependency injection.
   * @param context
   */
  public static getInstanceFromContext(context: ArgumentsHost | ExecutionContext): RequestService {
    const request = context.switchToHttp().getRequest();
    return new RequestService(request);
  }

  /**
   * Returns the inbound request.
   */
  public getRequest(): AppRequest {
    return this.request;
  }

  /**
   * Acquires all request metadata.
   */
  public getMetadata(): Record<string, any> {
    return this.request.raw.metadata || { };
  }

  /**
   * Acquires request metadata key.
   * @param key
   */
  public getMetadataKey<T>(key: string): T {
    return this.request.raw.metadata[key];
  }

  /**
   * Sets request metadata.
   * @param key
   * @param value
   */
  public setMetadataKey(key: string, value: any): void {
    this.request.raw.metadata ??= { };
    this.request.raw.metadata[key] = value;
  }

  /**
   * Returns true client IP.
   */
  public getClientIp(): string {
    const req = this.getRequest();
    const forwardedIp = /by.+?for=(.+?);/g.exec(req.headers.forwarded);
    return forwardedIp?.[1] || req.ips?.[req.ips.length - 1] || req.ip;
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
