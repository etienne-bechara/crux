import { HttpStatus } from '@nestjs/common';
import { IsIn } from 'class-validator';
import crypto from 'crypto';

import { Config, InjectSecret } from '../config/config.decorator';
import { AppEnvironment } from './app.enum';
import { AppOptions } from './app.interface';

// eslint-disable-next-line @typescript-eslint/naming-convention
export const APP_DEFAULT_OPTIONS: AppOptions = {
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
  sensitiveKeys: [
    'auth',
    'authentication',
    'authorization',
    'clientkey',
    'clientsecret',
    'key',
    'pass',
    'password',
  ],
  fastify: {
    trustProxy: true,
    genReqId: () => crypto.randomBytes(6).toString('base64url'),
  },
  redoc: {
    openApiUrl: 'http://127.0.0.1:8080/openapi/json',
    title: 'OpenAPI UI',
    favicon: 'https://www.openapis.org/wp-content/uploads/sites/3/2016/11/favicon.png',
    logo: {
      url: 'https://www.openapis.org/wp-content/uploads/sites/3/2016/10/OpenAPI_Pantone.png',
    },
    description: 'This API documentation is automatically generated based on `@nestjs/swagger` decorators.\n\n'
      + 'For further instructions on how to annotate your models and endpoints check '
      + '[NestJS - OpenAPI Introduction](https://docs.nestjs.com/openapi/introduction).\n\n'
      + 'To customize logo, title, description and other layout options, add the `redoc` property '
      + 'during application initialization:\n\n```\nvoid AppModule.boot({\n  redoc: { }\n});\n```',
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

  @InjectSecret()
  @IsIn(Object.values(AppEnvironment))
  public readonly NODE_ENV: AppEnvironment;

  @InjectSecret()
  public readonly APP_OPTIONS: AppOptions;

}
