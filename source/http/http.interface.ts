import { HttpStatus, ModuleMetadata } from '@nestjs/common';
import { Span, SpanOptions } from '@opentelemetry/api';
import { StringifyOptions } from 'query-string';

import { CacheStatus } from '../cache/cache.enum';
import { HttpMethod, HttpParser, HttpRedirect } from './http.enum';

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
  /** Time in milliseconds to await for cache acquisition before processing regularly. Default: 500ms. */
  cacheTimeout?: number;
}

export interface HttpSharedOptions extends HttpOptions {
  /** In case of an exception, ignore it and return the response object. */
  ignoreExceptions?: boolean;
  /** In case of an exception, will return to client the exact same code and body from upstream. */
  proxyExceptions?: boolean;
  /** Body parser to resolve request, if undefined returns the full Response object. */
  parser?: HttpParser;
  /** Whether request follows redirects, results in an error upon encountering a redirect, or returns the redirect. */
  redirect?: HttpRedirect;
  /** Request method. */
  method?: HttpMethod;
  /** Request URL. */
  url?: string;
  /** Request headers. */
  headers?: Record<string, string>;
  /** Request query params with array joining support. */
  query?: Record<string, any>;
  /** Query stringify options. */
  queryOptions?: StringifyOptions;
  /** Request body to be sent as JSON. Should not be used in combination with `body` or `form`. */
  json?: any;
  /** Request body to be sent as form encoded. Should not be used in combination with `body` or `json`. */
  form?: Record<string, string>;
}

export interface HttpModuleOptions extends HttpSharedOptions {
  /** Disable logs, metrics and traces. */
  disableTelemetry?: boolean;
  /** Disable trace propagation. */
  disablePropagation?: boolean;

}

export interface HttpRequestParams extends Omit<HttpSharedOptions, | 'retryMethods' | 'cacheMethods'> {
  /** Object containing replacement string for path variables. */
  replacements?: Record<string, string | number>;
  /** Request body. Should not be used in combination with `json` or `form`. */
  body?: any;
}

export interface HttpResponse extends Response {
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
  parser?: HttpParser;
  telemetry: HttpTelemetryParams;
  retry: HttpRetryParams;
  cache: HttpCacheParams;
  span?: Span;
  response?: Response;
  error?: Error;
}

export interface HttpRetryParams extends Pick<HttpSharedOptions, 'retryLimit' | 'retryCodes' | 'retryDelay'> {
  attempt: number;
}

export type HttpCacheParams = Pick<HttpSharedOptions, 'cacheTtl' | 'cacheMethods' | 'cacheTimeout'>;

export interface HttpTelemetryParams {
  method: HttpMethod;
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
