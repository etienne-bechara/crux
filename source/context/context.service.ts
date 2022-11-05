import { Injectable, UnauthorizedException } from '@nestjs/common';
import { Span } from '@opentelemetry/api';
import { ValidatorOptions } from 'class-validator';

import { AppRequest, AppResponse } from '../app/app.interface';
import { CacheStatus } from '../cache/cache.enum';
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
   * Get context request.
   */
  public getRequest(): AppRequest {
    return this.getStore()?.get(ContextStorageKey.REQUEST);
  }

  /**
   * Get context response.
   */
  public getResponse(): AppResponse {
    return this.getStore()?.get(ContextStorageKey.RESPONSE);
  }

  /**
   * Get request span.
   */
  public getRequestSpan(): Span {
    return this.getStore()?.get(ContextStorageKey.REQUEST_SPAN);
  }

  /**
   * Get context trace ID.
   */
  public getRequestTraceId(): string {
    return this.getRequestSpan()?.spanContext().traceId;
  }

  /**
   * Reads a metadata key bound to current request lifecycle.
   * @param key
   */
  public getMetadata<K extends keyof Metadata>(key: K): Metadata[K] {
    const metadata: Metadata = this.getStore()?.get(ContextStorageKey.REQUEST_METADATA) || { };
    return metadata[key];
  }

  /**
   * Create or update a metadata key bound to current request lifecycle.
   * @param key
   * @param value
   */
  public setMetadata<K extends keyof Metadata>(key: K, value: Metadata[K]): void {
    const metadata: Metadata = this.getStore()?.get(ContextStorageKey.REQUEST_METADATA) || { };
    metadata[key] = value;
    this.getStore()?.set(ContextStorageKey.REQUEST_METADATA, metadata);
  }

  /**
   * Reads all metadata bound to current request lifecycle,
   * returning object should be immutable.
   */
  public getRequestMetadata(): Metadata {
    const metadata: Metadata = this.getStore()?.get(ContextStorageKey.REQUEST_METADATA);
    return this.validateObjectLength({ ...metadata }) as Metadata;
  }

  /**
   * Acquire request id.
   */
  public getRequestId(): string {
    return this.getRequest()?.id;
  }

  /**
   * Acquire request method.
   */
  public getRequestMethod(): string {
    return this.getRequest()?.method;
  }

  /**
   * Acquire request protocol.
   */
  public getRequestProtocol(): string {
    return this.getRequest()?.protocol;
  }

  /**
   * Acquire request host.
   */
  public getRequestHost(): string {
    return this.getRequest()?.hostname;
  }

  /**
   * Acquire request path.
   */
  public getRequestPath(): string {
    const req = this.getRequest();
    return req?.routerPath || req?.url?.split('?')[0];
  }

  /**
   * Builds a request description including method and path.
   * @param step
   */
  public getRequestDescription(step: 'in' | 'out'): string {
    const description = `${this.getRequestMethod()} ${this.getRequestPath()}`;

    return step === 'in'
      ? `⯈ ${description}`
      : `⯇ ${description}`;
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

    if (req?.params) {
      delete req.params['*'];
    }

    return this.validateObjectLength(req?.params as Record<string, any>);
  }

  /**
   * Acquire request query params.
   */
  public getRequestQuery(): Record<string, any> {
    return this.validateObjectLength(this.getRequest()?.query as Record<string, any>);
  }

  /**
   * Acquire request body.
   */
  public getRequestBody(): any {
    return this.validateObjectLength(this.getRequest()?.body as unknown);
  }

  /**
   * Acquire request client IP.
   */
  public getRequestIp(): string {
    const req = this.getRequest();
    return req?.ips?.[req.ips.length - 1] || req?.ip;
  }

  /**
   * Acquire all request headers.
   */
  public getRequestHeaders(): Record<string, any> {
    return this.validateObjectLength(this.getRequest()?.headers as Record<string, any>);
  }

  /**
   * Acquire specific request header.
   * @param key
   */
  public getRequestHeader(key: string): string {
    return this.getRequestHeaders()?.[key.toLowerCase()];
  }

  /**
   * Acquire current request duration in seconds.
   */
  public getRequestDuration(): number {
    const req = this.getRequest();
    if (!req) return;

    return (Date.now() - req.time) / 1000;
  }

  /**
   * Acquire authorization header and decode its payload if applicable.
   */
  public getRequestJwtPayload(): ContextJwtPayload {
    const token: string = this.getRequestHeader('authorization');
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
   * Acquire current response status code.
   */
  public getResponseCode(): number {
    return this.getResponse()?.statusCode;
  }

  /**
   * Acquire all response headers.
   */
  public getResponseHeaders(): Record<string, string> {
    return this.getResponse()?.getHeaders();
  }

  /**
   * Acquire specific response header.
   * @param key
   */
  public getResponseHeader(key: string): string {
    return this.getResponse()?.getHeader(key);
  }

  /**
   * Acquires validator options of current context.
   */
  public getValidatorOptions(): ValidatorOptions {
    return this.getStore()?.get(ContextStorageKey.VALIDATOR_OPTIONS);
  }

  /**
   * Set validator options of current context.
   * @param options
   */
  public setValidatorOptions(options: ValidatorOptions): void {
    this.getStore()?.set(ContextStorageKey.VALIDATOR_OPTIONS, options);
  }

  /**
   * Acquires cache status of current context.
   */
  public getCacheStatus(): CacheStatus {
    const cacheStatus = this.getStore()?.get(ContextStorageKey.CACHE_STATUS);
    return cacheStatus || CacheStatus.DISABLED;
  }

  /**
   * Set cache status of current context.
   * @param status
   */
  public setCacheStatus(status: CacheStatus): void {
    this.getStore()?.set(ContextStorageKey.CACHE_STATUS, status);
  }

}
