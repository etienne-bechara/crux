import { HttpStatus, ModuleMetadata } from '@nestjs/common';
import { Span } from '@opentelemetry/api';
import { ExtendOptions, OptionsOfUnknownResponseBody, Response } from 'got';

import { HttpMethod } from './http.enum';

export interface HttpAsyncModuleOptions extends Pick<ModuleMetadata, 'imports'> {
  inject?: any[];
  useFactory?: (...args: any[]) => Promise<HttpModuleOptions> | HttpModuleOptions;
}

export interface HttpModuleOptions extends ExtendOptions {
  /** Display name for logging. */
  name?: string;
  /** Disable logging of operations. */
  silent?: boolean;
  /** In case of an exception, ignore it and return the response object. */
  ignoreExceptions?: boolean;
  /** In case of an exception, will return to client the exact same code and body from upstream. */
  proxyExceptions?: boolean;
  /** Request query params with array joining support, overrides `searchParams`. */
  query?: Record<string, string | string[]>;
  /** Query separator when joining string arrays. Default ','. */
  querySeparator?: string;
  /** @deprecated Use `retryLimit` and `retryCodes`. */
  retry?: never;
  /** Max amount of retries. Default: 2. */
  retryLimit?: number;
  /** HTTP methods to enable retry. Default: [ 'GET', 'PUT', 'HEAD', 'DELETE', 'OPTIONS', 'TRACE' ]. */
  retryMethods?: HttpMethod[];
  /** Response codes to attempt a retry. Default: [ 408, 429, 500, 502, 503, 504 ]. */
  retryCodes?: HttpStatus[];
  /** Retry delay in milliseconds based on number of attempts. Default: (a) => a > 4 ? 16_000 : 2 ** (a - 1) * 1000. */
  retryDelay?: (attempts: number) => number;
}

export interface HttpRequestParams extends OptionsOfUnknownResponseBody {
  /** In case of an exception, ignore it and return the response object. */
  ignoreExceptions?: boolean;
  /** In case of an exception, will return to client the exact same code and body from upstream. */
  proxyExceptions?: boolean;
  /** Object containing replacement string for path variables. */
  replacements?: Record<string, string>;
  /** Request query params with array joining support, overrides `searchParams`. */
  query?: Record<string, string | string[]>;
  /** Query separator when joining string arrays. Default ','. */
  querySeparator?: string;
  /** @deprecated Use `retryLimit` and `retryCodes`. */
  retry?: never;
  /** Max amount of retries. Default: 2. */
  retryLimit?: number;
  /** Response codes to attempt a retry. Default: [ 408, 429, 500, 502, 503, 504 ]. */
  retryCodes?: number[];
  /** Retry delay in milliseconds based on number of attempts. Default: (a) => a > 4 ? 16_000 : 2 ** (a - 1) * 1000. */
  retryDelay?: (attempts: number) => number;
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

export interface HttpRequestSendParams {
  url: string;
  request: HttpRequestParams;
  telemetry: HttpTelemetryParams;
  ignoreExceptions: boolean;
  resolveBodyOnly: boolean;
}

export interface HttpTelemetryParams {
  start: number;
  method: string;
  host: string;
  path: string;
  replacements: Record<string, string>;
  query: Record<string, string | string[]>;
  body: any;
  headers: any;
  span?: Span;
  response?: HttpResponse<unknown>;
}

export interface HttpExceptionParams extends HttpTelemetryParams {
  request: HttpRequestParams;
  error: any;
}
