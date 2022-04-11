import { IsIn, IsOptional, IsUrl } from 'class-validator';

import { Config, InjectConfig } from '../config/config.decorator';
import { LogSeverity } from '../log/log.enum';

@Config()
export class SentryConfig {

  @InjectConfig()
  @IsOptional()
  @IsUrl()
  public readonly SENTRY_DSN: string;

  @InjectConfig()
  @IsOptional()
  @IsIn(Object.values(LogSeverity))
  public readonly SENTRY_SEVERITY: LogSeverity;

}
