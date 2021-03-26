import { Injectable } from '@nestjs/common';
import { IsOptional, Matches } from 'class-validator';

import { AppEnvironment } from '../../../app/app.enum';
import { InjectSecret } from '../../../config/config.decorator';
import { LoggerConfig } from '../../logger.config';
import { LoggerLevel } from '../../logger.enum';
import { LoggerTransportOptions } from '../../logger.interface';

@Injectable()
export class SentryConfig extends LoggerConfig {

  @InjectSecret()
  @IsOptional()
  @Matches('^http.+?sentry\\.io')
  public readonly SENTRY_DSN: string;

  public readonly SENTRY_TRANSPORT_OPTIONS: LoggerTransportOptions[] = [
    { environment: AppEnvironment.LOCAL, level: null },
    { environment: AppEnvironment.DEVELOPMENT, level: LoggerLevel.ERROR },
    { environment: AppEnvironment.STAGING, level: LoggerLevel.ERROR },
    { environment: AppEnvironment.PRODUCTION, level: LoggerLevel.ERROR },
  ];

}
