import { IsIn, IsOptional, Matches } from 'class-validator';

import { AppEnvironment } from '../app/app.enum';
import { Config, InjectSecret } from '../config/config.decorator';
import { LoggerLevel } from '../logger/logger.enum';

@Config()
export class SentryConfig {

  @InjectSecret()
  @IsOptional()
  @Matches('^http.+?sentry\\.io')
  public readonly SENTRY_DSN: string;

  @InjectSecret({
    fallback: (environment) => {
      switch (environment) {
        case AppEnvironment.LOCAL: return null;
        case AppEnvironment.DEVELOPMENT: return LoggerLevel.ERROR;
        case AppEnvironment.STAGING: return LoggerLevel.ERROR;
        case AppEnvironment.PRODUCTION: return LoggerLevel.ERROR;
      }
    },
  })
  @IsOptional()
  @IsIn(Object.values(LoggerLevel))
  public readonly SENTRY_LEVEL: LoggerLevel;

}
