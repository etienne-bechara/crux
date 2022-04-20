import { HttpStatus, ModuleMetadata } from '@nestjs/common';
import { Span, SpanOptions } from '@opentelemetry/api';
import { ExtendOptions, OptionsOfUnknownResponseBody, Response } from 'got';

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
}

export interface HttpSharedOptions extends HttpOptions {
/** In case of an exception, ignore it and return the response object. */
  ignoreExceptions?: boolean;
  /** In case of an exception, will return to client the exact same code and body from upstream. */
  proxyExceptions?: boolean;
  /** Request query params with array joining support, overrides `searchParams`. */
  query?: Record<string, any>;
  /** Query separator when joining string arrays. Default ','. */
  querySeparator?: string;
  /** @deprecated Use `retryLimit` and `retryCodes`. */
  retry?: never;
}

export type HttpModuleOptionsBase = ExtendOptions & HttpSharedOptions;

export interface HttpModuleOptions extends HttpModuleOptionsBase {
  /** Display name for logging. */
  name?: string;
  /** Disables logging outbound request bodies. */
  filterRequestBody?: boolean;
  /** Disables logging outbound response bodies. */
  filterResponseBody?: boolean;
  /** Disable logs, metrics and traces. */
  disableTelemetry?: boolean;
  /** Disable trace propagation. */
  disablePropagation?: boolean;
}

export type HttpRequestParamsBase = OptionsOfUnknownResponseBody & HttpSharedOptions;

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

export interface HttpRetryParams {
  retryLimit: number;
  retryCodes: HttpStatus[];
  retryDelay: (attempts: number) => number;
  attempt: number;
}

export interface HttpRequestSendParams {
  url: string;
  request: HttpRequestParams;
  ignoreExceptions: boolean;
  resolveBodyOnly: boolean;
  telemetry: HttpTelemetryParams;
  retry: HttpRetryParams;
  span?: Span;
}

export interface HttpTelemetryParams {
  start: number;
  method: string;
  host: string;
  path: string;
  replacements: Record<string, string | number>;
  query: Record<string, any>;
  body: any;
  headers: any;
  spanName: string;
  spanOptions: SpanOptions;
  span?: Span;
  response?: HttpResponse<unknown>;
  error?: Error;
}

export interface HttpExceptionParams extends HttpTelemetryParams {
  request: HttpRequestParams;
  error: any;
}
