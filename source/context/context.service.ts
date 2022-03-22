import { Injectable, UnauthorizedException } from '@nestjs/common';
import { Tracer } from '@opentelemetry/sdk-trace-base';

import { AppRequest, AppResponse } from '../app/app.interface';
import { ContextStorageKey } from './context.enum';
import { ContextJwtPayload } from './context.interface';
import { ContextStorage } from './context.storage';

@Injectable()
export class ContextService<Metadata = Record<string, any>> {

  /**
   * Get local store for current context.
   */
  public getStore(): Map<string, any> {
    return ContextStorage.getStore();
  }

  /**
   * Get current request.
   */
  public getRequest(): AppRequest {
    return this.getStore()?.get(ContextStorageKey.REQUEST);
  }

  /**
   * Get current response.
   */
  public getResponse(): AppResponse {
    return this.getStore()?.get(ContextStorageKey.RESPONSE);
  }

  /**
   * Get current tracer.
   */
  public getTracer(): Tracer {
    return this.getStore()?.get(ContextStorageKey.TRACER);
  }

  /**
   * Reads a metadata key bound to current request lifecycle.
   * @param key
   */
  public getMetadata<K extends keyof Metadata>(key: K): Metadata[K] {
    const metadata: Metadata = this.getStore()?.get(ContextStorageKey.METADATA) || { };
    return metadata[key];
  }

  /**
   * Create or update a metadata key bound to current request lifecycle.
   * @param key
   * @param value
   */
  public setMetadata<K extends keyof Metadata>(key: K, value: Metadata[K]): void {
    const metadata: Metadata = this.getStore()?.get(ContextStorageKey.METADATA) || { };
    metadata[key] = value;
    this.getStore().set(ContextStorageKey.METADATA, metadata);
  }

  /**
   * Reads all metadata bound to current request lifecycle,
   * returning object should be immutable.
   */
  public getRequestMetadata(): Metadata {
    const metadata: Metadata = this.getStore()?.get(ContextStorageKey.METADATA);
    return this.validateObjectLength({ ...metadata }) as Metadata;
  }

  /**
   * Acquire request id.
   */
  public getRequestId(): string {
    const req = this.getRequest();
    if (!req) return;

    return req.id;
  }

  /**
   * Acquire request method.
   */
  public getRequestMethod(): string {
    const req = this.getRequest();
    if (!req) return;

    return req.method;
  }

  /**
   * Acquire request path.
   */
  public getRequestPath(): string {
    const req = this.getRequest();
    if (!req) return;

    return req.routerPath || req.url;
  }

  /**
   * Ensures target object is valid and contain at least one key,
   * if not return as `undefined`.
   * @param obj
   */
  private validateObjectLength(obj: Record<string, any>): Record<string, any> {
    return obj && Object.keys(obj).length > 0 ? obj : undefined;
  }

  /**
   * Acquire request path replacement params.
   */
  public getRequestParams(): Record<string, any> {
    const req = this.getRequest();
    if (!req) return;

    if (req.params) {
      delete req.params['*'];
    }

    return this.validateObjectLength(req.params as Record<string, any>);
  }

  /**
   * Acquire true client IP.
   */
  public getRequestQuery(): Record<string, any> {
    const req = this.getRequest();
    if (!req) return;

    return this.validateObjectLength(req.query as Record<string, any>);
  }

  /**
   * Acquire true client IP.
   */
  public getRequestBody(): Record<string, any> {
    const req = this.getRequest();
    if (!req) return;

    return this.validateObjectLength(req.body as Record<string, any>);
  }

  /**
   * Acquire request client IP.
   */
  public getRequestIp(): string {
    const req = this.getRequest();
    if (!req) return;

    return req.ips?.[req.ips.length - 1] || req.ip;
  }

  /**
   * Acquire request headers.
   */
  public getRequestHeaders(): Record<string, any> {
    const req = this.getRequest();
    if (!req) return;

    return this.validateObjectLength(req.headers as Record<string, any>);
  }

  /**
   * Acquire request client user agent.
   */
  public getRequestUserAgent(): string {
    return this.getRequestHeaders()?.['user-agent'];
  }

  /**
   * Acquire current request latency in milliseconds.
   */
  public getRequestLatency(): number {
    const req = this.getRequest();
    if (!req) return;

    return Date.now() - req.time;
  }

  /**
   * Acquire authorization header and decode its payload if applicable.
   */
  public getRequestJwtPayload(): ContextJwtPayload {
    const token: string = this.getRequest()?.headers.authorization;
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
      throw new UnauthorizedException('invalid jwt payload');
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

  /**
   * Builds a request description including method, path, ip and user agent.
   * If `code` is provided consider as outbound and add latency details.
   * @param step
   */
  public getRequestDescription(step: 'in' | 'out'): string {
    const description = `${this.getRequestMethod()} ${this.getRequestPath()}`;

    return step === 'in'
      ? `⯈ ${description}`
      : `⯇ ${description}`;
  }

  /**
   * Acquire current response status code.
   */
  public getResponseCode(): number {
    const res = this.getResponse();
    if (!res) return;

    return res.statusCode;
  }

}
