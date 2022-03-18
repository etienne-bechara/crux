import { IsIn, IsOptional, Matches } from 'class-validator';

import { Config, InjectSecret } from '../config/config.decorator';
import { LoggerSeverity } from '../logger/logger.enum';

@Config()
export class SentryConfig {

  @InjectSecret()
  @IsOptional()
  @Matches('^http.+?sentry\\.io')
  public readonly SENTRY_DSN: string;

  @InjectSecret()
  @IsOptional()
  @IsIn(Object.values(LoggerSeverity))
  public readonly SENTRY_SEVERITY: LoggerSeverity;

}
