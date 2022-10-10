/* eslint-disable @typescript-eslint/naming-convention */
/* eslint-disable max-len */
import { HttpStatus } from '@nestjs/common';
import { IsIn } from 'class-validator';
import crypto from 'crypto';

import { Config, InjectConfig } from '../config/config.decorator';
import { DocCodeSampleClient } from '../doc/doc.enum';
import { DocTheme } from '../doc/doc.interface';
import { HttpMethod } from '../http/http.enum';
import { LogSeverity } from '../log/log.enum';
import { MetricHttpStrategy } from '../metric/metric.enum';
import { AppEnvironment } from './app.enum';
import { AppOptions } from './app.interface';

/**
 * Builds upon default theme available at:
 * https://github.com/Redocly/redoc/blob/main/src/theme.ts.
 *
 * Theming sandbox is available at:
 * https://pointnet.github.io/redoc-editor.
 */
export const APP_DEFAULT_DOC_THEME: DocTheme = {
  logo: {
    gutter: '35px',
  },
  typography: {
    smoothing: 'subpixel-antialiased',
    fontFamily: 'Segoe UI',
    headings: {
      fontFamily: 'Segoe UI',
    },
    code: {
      wrap: true,
      fontFamily: 'Consolas',
    },
  },
  colors: {
    primary: {
      main: '#32329f',
    },
  },
  rightPanel: {
    backgroundColor: '#263238',
    textColor: '#ffffff',
  },
  codeBlock: {
    backgroundColor: '#11171a',
  },
  scrollbar: {
    width: '16px',
    thumbColor: '#263238',
    trackColor: '#192226',
  },
};

export const APP_DEFAULT_OPTIONS: AppOptions = {
  name: 'unknown',
  instance: crypto.randomBytes(8).toString('hex'),
  port: 8080,
  hostname: '0.0.0.0',
  timeout: 60_000,
  cors: {
    origin: '*',
    methods: 'GET,HEAD,PUT,PATCH,POST,DELETE',
    preflightContinue: false,
    optionsSuccessStatus: 204,
  },
  httpErrors: [
    HttpStatus.INTERNAL_SERVER_ERROR,
    HttpStatus.NOT_IMPLEMENTED,
    HttpStatus.BAD_GATEWAY,
    HttpStatus.SERVICE_UNAVAILABLE,
    HttpStatus.GATEWAY_TIMEOUT,
    HttpStatus.HTTP_VERSION_NOT_SUPPORTED,
  ],
  fastify: {
    trustProxy: true,
    genReqId: () => crypto.randomBytes(16).toString('hex'),
  },
  validator: {
    whitelist: true,
    forbidNonWhitelisted: true,
    always: true,
    strictGroups: true,
  },
  cache: {
    defaultTimeout: 2000,
    defaultTtl: 60_000,
    bucketTtl: 30 * 24 * 60 * 60 * 1000,
  },
  http: {
    retryLimit: 2,
    retryMethods: [
      HttpMethod.GET,
      HttpMethod.PUT,
      HttpMethod.HEAD,
      HttpMethod.DELETE,
      HttpMethod.OPTIONS,
      HttpMethod.TRACE,
    ],
    retryCodes: [
      HttpStatus.REQUEST_TIMEOUT,
      HttpStatus.TOO_MANY_REQUESTS,
      HttpStatus.INTERNAL_SERVER_ERROR,
      HttpStatus.BAD_GATEWAY,
      HttpStatus.SERVICE_UNAVAILABLE,
      HttpStatus.GATEWAY_TIMEOUT,
    ],
    retryDelay: (attempts: number): number => {
      return attempts > 4 ? 16_000 : 2 ** (attempts - 1) * 1000;
    },
  },
  logs: {
    sensitiveKeys: [
      'apikey',
      'authorization',
      'clientkey',
      'clientsecret',
      'pass',
      'password',
    ],
  },
  console: {
    maxLength: 1000,
  },
  loki: {
    severity: LogSeverity.HTTP,
    pushInterval: 60_000,
    batchSize: 1000,
  },
  slack: {
    severity: LogSeverity.WARNING,
  },
  metrics: {
    pushInterval: 60_000,
    httpStrategy: MetricHttpStrategy.SUMMARY,
    httpPercentiles: [ 0.99, 0.95, 0.5 ],
    httpBuckets: [ 0.05, 0.1, 0.25, 0.5, 1, 2.5, 5, 10, 25, 50 ],
  },
  traces: {
    pushInterval: 60_000,
  },
  docs: {
    disableTryIt: false,
    hideLoading: true,
    enumSkipQuotes: true,
    title: 'API Reference | OpenAPI',
    version: 'v1',
    favicon: 'https://www.openapis.org/wp-content/uploads/sites/3/2016/11/favicon.png',
    logo: { url: 'https://www.openapis.org/wp-content/uploads/sites/3/2016/10/OpenAPI_Pantone.png' },
    theme: APP_DEFAULT_DOC_THEME,
    codeSamples: [
      { label: 'cURL', client: DocCodeSampleClient.SHELL_CURL },
      { label: 'PowerShell', client: DocCodeSampleClient.POWERSHELL_WEBREQUEST },
    ],
  },
};

@Config()
export class AppConfig {

  @InjectConfig()
  @IsIn(Object.values(AppEnvironment))
  public readonly NODE_ENV: AppEnvironment;

  @InjectConfig()
  public readonly APP_OPTIONS: AppOptions;

}
