import { IsIn, IsOptional } from 'class-validator';

import { AppEnvironment } from '../app/app.enum';
import { Config, InjectSecret } from '../config/config.decorator';
import { LoggerLevel } from '../logger/logger.enum';

@Config()
export class ConsoleConfig {

  @InjectSecret({
    fallback: (environment) => {
      switch (environment) {
        case AppEnvironment.LOCAL: return LoggerLevel.TRACE;
        case AppEnvironment.DEVELOPMENT: return LoggerLevel.WARNING;
        case AppEnvironment.STAGING: return LoggerLevel.WARNING;
        case AppEnvironment.PRODUCTION: return LoggerLevel.WARNING;
      }
    },
  })
  @IsOptional()
  @IsIn(Object.values(LoggerLevel))
  public readonly CONSOLE_LEVEL: LoggerLevel;

}
