import { HttpException, HttpStatus, INestApplication, ModuleMetadata } from '@nestjs/common';
import { CorsOptions } from '@nestjs/common/interfaces/external/cors-options.interface';
import http from 'http';

import { CacheOptions } from '../cache/cache.interface';
import { ConsoleOptions } from '../console/console.interface';
import { DocOptions } from '../doc/doc.interface';
import { HttpMethod } from '../http/http.enum';
import { HttpExceptionData, HttpOptions } from '../http/http.interface';
import { LogOptions } from '../log/log.interface';
import { LokiOptions } from '../loki/loki.interface';
import { MetricOptions } from '../metric/metric.interface';
import { TraceOptions } from '../trace/trace.interface';
import { ValidateOptions } from '../validate/validate.interface';

export interface AppOptions extends ModuleMetadata {
  /** Provide an already built instance to skip `.compile()` step. */
  app?: INestApplication;
  /** Environment variables file path. Default: Scans for `.env` on current and parent dirs. */
  envPath?: string;
  /** Disables all custom implementations (which can also be individually disabled). */
  disableAll?: boolean;
  /** Disables automatically importing `*.module.ts` files. */
  disableScan?: boolean;
  /** Disables built-in exception filter `app.filter.ts`. */
  disableFilter?: boolean;
  /** Disables validation pipe which applies `class-validator` decorators. */
  disableValidator?: boolean;
  /** Disables HTTP caching. */
  disableCache?: boolean;
  /** Disables all logging transports (Console and Loki). */
  disableLogs?: boolean;
  /** Disables metrics collector and `metrics` endpoint. */
  disableMetrics?: boolean;
  /** Disables request tracer. */
  disableTraces?: boolean;
  /** Disables documentation generator and `docs` endpoint. */
  disableDocs?: boolean;
  /** Application name, also used as job name for telemetry. */
  name?: string;
  /** Instance ID for telemetry. */
  instance?: string;
  /** Application port. Default: 8080. */
  port?: number;
  /** Application hostname. Default: `0.0.0.0`. */
  hostname?: string;
  /** Application prefix to apply to all endpoints. */
  globalPrefix?: string;
  /** Application static assets path relative to current work directory. Default: `assets`. */
  assetsPrefix?: string;
  /** Application request timeout in milliseconds. Default: 60s. */
  timeout?: number;
  /** Application CORS response. */
  cors?: CorsOptions;
  /** HTTP exceptions that should be logged as errors. Default: Array of all `5xx` status. */
  httpErrors?: HttpStatus[];
  /** Extra underlying HTTP adapter options. */
  fastify?: Record<string, any>;
  /** Validation pipe options. Can be overwritten per request using `ContextService`. */
  validator?: ValidateOptions;
  /** Cache configuration. */
  cache?: CacheOptions;
  /** Http configuration. */
  http?: HttpOptions;
  /** Logs configuration. */
  logs?: LogOptions;
  /** Console logging transport configuration. */
  console?: ConsoleOptions;
  /** Loki logging transport configuration. */
  loki?: LokiOptions;
  /** Metrics configuration. */
  metrics?: MetricOptions;
  /** Traces configuration. */
  traces?: TraceOptions;
  /** Documentation configuration. */
  docs?: DocOptions;
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
  method: HttpMethod;
  url: string;
  is404: boolean;
  socket: any;
  context: any;
  routeOptions: {
    method: HttpMethod;
    url: string;
    bodyLimit: number;
    attachValidation: boolean;
    logLevel: string;
    exposeHeadRoute: boolean;
    prefixTrailingSlash: string;
  };
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

export interface AppExceptionDetails extends Partial<HttpExceptionData>, Record<string, any> {
  constraints?: string[];
}

export interface AppExceptionResponse {
  code: number;
  body: unknown;
}
