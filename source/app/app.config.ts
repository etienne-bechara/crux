/* eslint-disable @typescript-eslint/naming-convention */
/* eslint-disable max-len */
import { HttpStatus } from '@nestjs/common';
import { CorsOptions } from '@nestjs/common/interfaces/external/cors-options.interface';
import crypto from 'crypto';

import { CACHE_DEFAULT_OPTIONS } from '../cache/cache.config';
import { Config, InjectConfig } from '../config/config.decorator';
import { CONSOLE_DEFAULT_OPTIONS } from '../console/console.config';
import { DOC_DEFAULT_OPTIONS } from '../doc/doc.config';
import { HTTP_DEFAULT_OPTIONS } from '../http/http.config';
import { LOG_DEFAULT_OPTIONS } from '../log/log.config';
import { LOKI_DEFAULT_OPTIONS } from '../loki/loki.config';
import { METRIC_DEFAULT_OPTIONS } from '../metric/metric.config';
import { TRACE_DEFAULT_OPTIONS } from '../trace/trace.config';
import { VALIDATOR_DEFAULT_OPTIONS } from '../validate/validate.config';
import { IsEnum } from '../validate/validate.decorator';
import { AppEnvironment } from './app.enum';
import { AppOptions } from './app.interface';

export const CORS_DEFAULT_OPTIONS: CorsOptions = {
  origin: '*',
  methods: 'GET,HEAD,PUT,PATCH,POST,DELETE',
  preflightContinue: false,
  optionsSuccessStatus: 204,
};

export const FASTIFY_DEFAULT_OPTIONS: Record<string, any> = {
  trustProxy: true,
  genReqId: () => crypto.randomBytes(16).toString('hex'),
};

export const APP_DEFAULT_OPTIONS: AppOptions = {
  name: 'unknown',
  instance: crypto.randomBytes(8).toString('hex'),
  assetsPrefix: 'assets',
  port: 8080,
  hostname: '0.0.0.0',
  timeout: 60_000,
  cors: CORS_DEFAULT_OPTIONS,
  httpErrors: [
    HttpStatus.INTERNAL_SERVER_ERROR,
    HttpStatus.NOT_IMPLEMENTED,
    HttpStatus.BAD_GATEWAY,
    HttpStatus.SERVICE_UNAVAILABLE,
    HttpStatus.GATEWAY_TIMEOUT,
    HttpStatus.HTTP_VERSION_NOT_SUPPORTED,
  ],
  fastify: FASTIFY_DEFAULT_OPTIONS,
  validator: VALIDATOR_DEFAULT_OPTIONS,
  cache: CACHE_DEFAULT_OPTIONS,
  http: HTTP_DEFAULT_OPTIONS,
  logs: LOG_DEFAULT_OPTIONS,
  console: CONSOLE_DEFAULT_OPTIONS,
  loki: LOKI_DEFAULT_OPTIONS,
  metrics: METRIC_DEFAULT_OPTIONS,
  traces: TRACE_DEFAULT_OPTIONS,
  docs: DOC_DEFAULT_OPTIONS,
};

@Config()
export class AppConfig {

  @InjectConfig()
  @IsEnum(AppEnvironment)
  public readonly NODE_ENV: AppEnvironment;

  @InjectConfig()
  public readonly APP_OPTIONS: AppOptions;

}
