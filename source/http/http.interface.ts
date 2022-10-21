import { HttpStatus, ModuleMetadata } from '@nestjs/common';
import { Span, SpanOptions } from '@opentelemetry/api';
import { ExtendOptions, OptionsOfUnknownResponseBody, Response } from 'got';
import { StringifyOptions } from 'query-string';

import { CacheStatus } from '../cache/cache.enum';
import { HttpMethod } from './http.enum';

export interface HttpAsyncModuleOptions extends Pick<ModuleMetadata, 'imports'> {
  inject?: any[];
  useFactory?: (...args: any[]) => Promise<HttpModuleOptions> | HttpModuleOptions;
}

export interface HttpOptions {
  /** Max amount of retries. Default: 2. */
  retryLimit?: number;
  /** HTTP methods to enable retry. Default: [ 'GET', 'PUT', 'HEAD', 'DELETE', 'OPTIONS', 'TRACE' ]. */
  retryMethods?: HttpMethod[];
  /** Response codes to attempt a retry. Default: [ 408, 429, 500, 502, 503, 504 ]. */
  retryCodes?: HttpStatus[];
  /** Retry delay in milliseconds based on number of attempts. Default: (a) => a > 4 ? 16_000 : 2 ** (a - 1) * 1000. */
  retryDelay?: (attempts: number) => number;
  /** Time to live in milliseconds, cache is disable when zero. Default: 0. */
  cacheTtl?: number;
  /** HTTP methods to enable cache. Default: [ 'GET', 'HEAD' ]. */
  cacheMethods?: HttpMethod[];
  /** Time in milliseconds to await for cache acquisition before processing regularly. Default: 2000. */
  cacheTimeout?: number;
}

export interface HttpSharedOptions extends HttpOptions {
/** In case of an exception, ignore it and return the response object. */
  ignoreExceptions?: boolean;
  /** In case of an exception, will return to client the exact same code and body from upstream. */
  proxyExceptions?: boolean;
  /** Request query params with array joining support, overrides `searchParams`. */
  query?: Record<string, any>;
  /** Query stringify options. */
  queryOptions?: StringifyOptions;
}

export type HttpModuleOptionsBase =
  Omit<ExtendOptions, 'retry' | 'cache' | 'cacheOptions'>
  & HttpSharedOptions;

export interface HttpModuleOptions extends HttpModuleOptionsBase {
  /** Display name for logging. */
  name?: string;
  /** Disable logs, metrics and traces. */
  disableTelemetry?: boolean;
  /** Disable trace propagation. */
  disablePropagation?: boolean;
}

export type HttpRequestParamsBase =
  Omit<OptionsOfUnknownResponseBody, 'retry' | 'cache' | 'cacheOptions'>
  & Omit<HttpSharedOptions, 'retryMethods' | 'cacheMethods'>;

export interface HttpRequestParams extends HttpRequestParamsBase {
  /** Object containing replacement string for path variables. */
  replacements?: Record<string, string | number>;
}

export interface HttpResponse<T> extends Response<T> {
  cookies?: HttpCookie[];
}

export interface HttpCookie {
  name: string;
  value: string;
  domain: string;
  path: string;
  expires: Date;
}

export interface HttpRequestFlowParams {
  url: string;
  request: HttpRequestParams;
  ignoreExceptions: boolean;
  resolveBodyOnly: boolean;
  telemetry: HttpTelemetryParams;
  retry: HttpRetryParams;
  cache: HttpCacheParams;
  span?: Span;
  response?: HttpResponse<unknown>;
  error?: Error;
}

export interface HttpRetryParams extends Pick<HttpSharedOptions, 'retryLimit' | 'retryCodes' | 'retryDelay'> {
  attempt: number;
}

export type HttpCacheParams = Pick<HttpSharedOptions, 'cacheTtl' | 'cacheMethods' | 'cacheTimeout'>;

export interface HttpTelemetryParams {
  method: string;
  host: string;
  path: string;
  replacements: Record<string, string | number>;
  query: Record<string, any>;
  body: any;
  headers: any;
  spanOptions: SpanOptions;
  start?: number;
  span?: Span;
  cacheStatus?: CacheStatus;
}
