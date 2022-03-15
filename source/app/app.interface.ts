import { HttpException, HttpStatus, INestApplication, ModuleMetadata } from '@nestjs/common';
import { CorsOptions } from '@nestjs/common/interfaces/external/cors-options.interface';
import { ApiResponseOptions } from '@nestjs/swagger';
import { OperationObject } from '@nestjs/swagger/dist/interfaces/open-api-spec.interface';
import http from 'http';

import { MetricOptions } from '../metric/metric.interface';
import { RedocAppOptions } from '../redoc/redoc.interface';

export interface AppOptions extends ModuleMetadata {
  /** Provide an already built instance to skip `.compile()` step. */
  instance?: INestApplication;
  /** Environment variables file path. Default: `.env`. */
  envPath?: string;
  /** Disables all custom implementations (which can also be individually disabled). */
  disableAll?: boolean;
  /** Disables automatically importing `*.module.ts` files. */
  disableScan?: boolean;
  /** Disables status endpoints `/` and `/status`. */
  disableStatus?: boolean;
  /** Disables built-in exception filter `app.filter.ts`. */
  disableFilter?: boolean;
  /** Disables serialization interceptor which applies `class-transformer` decorators. */
  disableSerializer?: boolean;
  /** Disables validation pipe which applies `class-validator` decorators. */
  disableValidator?: boolean;
  /** Disables logger transports (Console, Sentry and Slack). */
  disableLogger?: boolean;
  /** Disables metrics collector and `metrics` endpoint. */
  disableMetrics?: boolean;
  /** Disables documentation generator and `docs` endpoint. */
  disableDocumentation?: boolean;
  /** Disable `AsyncModule` and `MemoryModule` utilities. */
  disableUtilities?: boolean;
  /** Application port. Default: 8080. */
  port?: number;
  /** Application hostname. Default: `0.0.0.0`. */
  hostname?: string;
  /** Application global prefix path. */
  globalPrefix?: string;
  /** Application request timeout in milliseconds. Default: 60000. */
  timeout?: number;
  /** Application CORS response. */
  cors?: CorsOptions;
  /** HTTP exceptions that should be logged as errors. Default: Array of all `5xx` status. */
  httpErrors?: HttpStatus[];
  /** Sensitive keys to be removed during logging of objects. */
  sensitiveKeys?: string[];
  /** Format JSON when printing log details at console. */
  prettyPrint?: boolean;
  /** Extra underlying HTTP adapter options. */
  fastify?: Record<string, any>;
  /** Metrics configurations. */
  metrics?: MetricOptions;
  /** Redoc rendered documentation page options. */
  redoc?: RedocAppOptions;
}

/**
 * Equivalent to request wrapper created by Fastify
 * after going through the middlewares.
 */
export interface AppRequest {
  time: number;
  query: any;
  body: any;
  params: any;
  headers: any;
  raw: AppRawRequest;
  server: any;
  id: string;
  log: any;
  ip: string;
  ips: string[];
  hostname: string;
  protocol: 'http' | 'https';
  method: string;
  url: string;
  routerMethod: string;
  routerPath: string;
  is404: boolean;
  socket: any;
  context: any;
}

/**
 * Equivalent to http request before applying middlewares.
 */
export interface AppRawRequest extends http.IncomingMessage {
  metadata: any;
}

export interface AppResponse {
  code: (code: number) => void;
  status: (code: number) => void;
  statusCode: number;
  server: any;
  header: (name: string, value: string) => void;
  headers: (headers: Record<string, string>) => void;
  getHeader: (name: string) => any;
  getHeaders: () => Record<string, any>;
  removeHeader: (name: string) => void;
  hasHeader: (name: string) => boolean;
  type: (value: string) => void;
  redirect: (code: number, dest: string) => void;
  callNotFound: () => void;
  serialize: (payload: any) => string;
  serializer: any;
  send: (payload: any) => void;
  sent: boolean;
  raw: http.ServerResponse;
  log: any;
  request: AppRequest;
  context: any;
}

export interface AppException {
  exception: HttpException | Error;
  code: HttpStatus;
  message: string;
  details: AppExceptionDetails;
}

export interface AppExceptionDetails extends Record<string, any> {
  proxyExceptions?: boolean;
  outboundResponse?: Record<string, any>;
  outboundRequest?: Record<string, any>;
  constraints?: string[];
}

export interface AppExceptionResponse extends Record<string, any> {
  code: number;
  message: string;
}

export interface AppControllerParams {
  tags?: string[];
  hidden?: boolean;
}

export interface AppMethodParams extends Partial<OperationObject> {
  tags?: string[];
  hidden?: boolean;
  response?: ApiResponseOptions;
}
