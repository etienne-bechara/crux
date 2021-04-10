import { Injectable } from '@nestjs/common';
import { IsOptional, Matches } from 'class-validator';

import { AppEnvironment } from '../../../app/app.enum';
import { InjectSecret } from '../../../config/config.decorator';
import { LoggerConfig } from '../../logger.config';
import { LoggerLevel } from '../../logger.enum';

@Injectable()
export class SentryConfig extends LoggerConfig {

  @InjectSecret()
  @IsOptional()
  @Matches('^http.+?sentry\\.io')
  public readonly SENTRY_DSN: string;

  @InjectSecret({
    default: (nodeEnv) => {
      switch (nodeEnv) {
        case AppEnvironment.LOCAL: return null;
        case AppEnvironment.DEVELOPMENT: return LoggerLevel.ERROR;
        case AppEnvironment.STAGING: return LoggerLevel.ERROR;
        case AppEnvironment.PRODUCTION: return LoggerLevel.ERROR;
      }
    },
  })
  public readonly SENTRY_LEVEL: LoggerLevel;

}
