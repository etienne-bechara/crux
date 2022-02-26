import { ModuleMetadata } from '@nestjs/common';
import { ExtendOptions, OptionsOfUnknownResponseBody, Response } from 'got';

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
  /** Overwrite search params adding the ability to provide array values. */
  query?: Record<string, any>;
}

export interface HttpRequestParams extends OptionsOfUnknownResponseBody {
  /** In case of an exception, ignore it and return the response object. */
  ignoreExceptions?: boolean;
  /** In case of an exception, will return to client the exact same code and body from upstream. */
  proxyExceptions?: boolean;
  /** Object containing replacement string for path variables. */
  replacements?: Record<string, string>;
  /** Overwrite search params adding the ability to provide array values. */
  query?: Record<string, any>;
}

export interface HttpResponse<T> extends Response<T> {
  cookies: HttpCookie[];
}

export interface HttpCookie {
  name: string;
  value: string;
  domain: string;
  path: string;
  expires: Date;
}

export interface HttpMetricParams {
  start: number;
  method: string;
  host: string;
  path: string;
  code?: string;
}

export interface HttpExceptionParams extends HttpMetricParams {
  request: HttpRequestParams;
  error: any;
}
