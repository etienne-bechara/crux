import { IsIn, IsOptional, Matches } from 'class-validator';

import { AppEnvironment } from '../app/app.enum';
import { Config, InjectSecret } from '../config/config.decorator';
import { LoggerSeverity } from '../logger/logger.enum';

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
        case AppEnvironment.DEVELOPMENT: return LoggerSeverity.ERROR;
        case AppEnvironment.STAGING: return LoggerSeverity.ERROR;
        case AppEnvironment.PRODUCTION: return LoggerSeverity.ERROR;
      }
    },
  })
  @IsOptional()
  @IsIn(Object.values(LoggerSeverity))
  public readonly SENTRY_LEVEL: LoggerSeverity;

}
