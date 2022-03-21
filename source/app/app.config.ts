/* eslint-disable max-len */
import { HttpStatus } from '@nestjs/common';
import { IsIn } from 'class-validator';
import crypto from 'crypto';

import { Config, InjectConfig } from '../config/config.decorator';
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
  sensitiveKeys: [
    'apikey',
    'auth',
    'authentication',
    'authorization',
    'clientkey',
    'clientsecret',
    'pass',
    'password',
  ],
  console: {
    maxLength: 1000,
  },
  loki: {
    severity: LogSeverity.DEBUG,
    pushInterval: 20_000,
    batchSize: 1000,
  },
  slack: {
    severity: LogSeverity.WARNING,
  },
  sentry: {
    severity: LogSeverity.ERROR,
  },
  metrics: {
    pushInterval: 20_000,
    httpBuckets: [
      10, 20, 30, 50, 70,
      100, 200, 300, 500, 700,
      1000, 2000, 3000, 5000, 7000,
      10_000, 20_000, 30_000, 50_000, 70_000,
    ],
  },
  docs: {
    openApiUrl: 'http://127.0.0.1:8080/openapi/json',
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
