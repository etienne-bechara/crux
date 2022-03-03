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
};

@Config()
export class AppConfig {

  @InjectSecret()
  @IsIn(Object.values(AppEnvironment))
  public readonly NODE_ENV: AppEnvironment;

  @InjectSecret()
  public readonly APP_OPTIONS: AppOptions;

}
