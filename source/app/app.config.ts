/* eslint-disable max-len */
import { HttpStatus } from '@nestjs/common';
import { IsIn } from 'class-validator';
import crypto from 'crypto';

import { Config, InjectConfig } from '../config/config.decorator';
import { HttpMethod } from '../http/http.enum';
import { LogSeverity } from '../log/log.enum';
import { AppEnvironment } from './app.enum';
import { AppOptions } from './app.interface';

// eslint-disable-next-line @typescript-eslint/naming-convention
export const APP_DEFAULT_OPTIONS: AppOptions = {
  job: 'unknown',
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
  sentry: {
    severity: LogSeverity.ERROR,
  },
  metrics: {
    pushInterval: 60_000,
    httpDurationBuckets: [
      0.1, 0.25, 0.5, 1, 2.5,
      5, 10, 25, 50, 100,
    ],
  },
  traces: {
    pushInterval: 60_000,
  },
  docs: {
    title: 'OpenAPI UI',
    version: '1.0.0',
    favicon: 'https://www.openapis.org/wp-content/uploads/sites/3/2016/11/favicon.png',
    logo: {
      url: 'https://www.openapis.org/wp-content/uploads/sites/3/2016/10/OpenAPI_Pantone.png',
    },
    description: 'This API documentation is automatically generated based on `@nestjs/swagger` decorators.\n'
      + '\n'
      + 'For further instructions on how to annotate your models and endpoints check [NestJS - OpenAPI Introduction](https://docs.nestjs.com/openapi/introduction).\n'
      + '\n'
      + 'To customize logo, title, description and other layout options, configure the `docs` property during application initialization:\n'
      + '\n```ts\n'
      + 'void AppModule.boot({\n'
      + '  docs: {\n'
      + '    title: \'User API\',\n'
      + '    description: \'Manipulate user related data.\',\n'
      + '    // ...\n'
      + '  }\n'
      + '});\n'
      + '```',
    theme: {
      logo: {
        gutter: '25px',
      },
      typography: {
        fontFamily: 'Lato',
        headings: {
          fontFamily: 'Lato',
        },
      },
    },
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
