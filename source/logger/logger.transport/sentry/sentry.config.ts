import { Injectable } from '@nestjs/common';
import { IsNumber, IsOptional, Matches, Max, Min } from 'class-validator';

import { AppEnvironment } from '../../../app/app.enum';
import { InjectSecret } from '../../../config/config.decorator';
import { ToNumber } from '../../../transform/transform.decorator';
import { LoggerConfig } from '../../logger.config';
import { LoggerLevel } from '../../logger.enum';

@Injectable()
export class SentryConfig extends LoggerConfig {

  @InjectSecret()
  @IsOptional()
  @Matches('^http.+?sentry\\.io')
  public readonly SENTRY_DSN: string;

  @InjectSecret({
    baseValue: (nodeEnv) => {
      switch (nodeEnv) {
        case AppEnvironment.LOCAL: return null;
        case AppEnvironment.DEVELOPMENT: return LoggerLevel.ERROR;
        case AppEnvironment.STAGING: return LoggerLevel.ERROR;
        case AppEnvironment.PRODUCTION: return LoggerLevel.ERROR;
      }
    },
  })
  @IsOptional()
  @ToNumber()
  @IsNumber() @Min(0) @Max(8)
  public readonly SENTRY_LEVEL: LoggerLevel;

}
