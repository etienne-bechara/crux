import { IsIn, IsOptional } from 'class-validator';

import { AppEnvironment } from '../app/app.enum';
import { Config, InjectSecret } from '../config/config.decorator';
import { LoggerSeverity } from '../logger/logger.enum';

@Config()
export class ConsoleConfig {

  @InjectSecret({
    fallback: (environment) => {
      switch (environment) {
        case AppEnvironment.LOCAL: return LoggerSeverity.TRACE;
        case AppEnvironment.DEVELOPMENT: return LoggerSeverity.WARNING;
        case AppEnvironment.STAGING: return LoggerSeverity.WARNING;
        case AppEnvironment.PRODUCTION: return LoggerSeverity.WARNING;
      }
    },
  })
  @IsOptional()
  @IsIn(Object.values(LoggerSeverity))
  public readonly CONSOLE_LEVEL: LoggerSeverity;

}
