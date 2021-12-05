import { IsNumber, IsOptional, Max, Min } from 'class-validator';

import { AppEnvironment } from '../../../app/app.enum';
import { Config, InjectSecret } from '../../../config/config.decorator';
import { ToNumber } from '../../../transform/transform.decorator';
import { LoggerConfig } from '../../logger.config';
import { LoggerLevel } from '../../logger.enum';

@Config()
export class ConsoleConfig extends LoggerConfig {

  @InjectSecret({
    baseValue: (nodeEnv) => {
      switch (nodeEnv) {
        case AppEnvironment.LOCAL: return LoggerLevel.TRACE;
        case AppEnvironment.DEVELOPMENT: return LoggerLevel.NOTICE;
        case AppEnvironment.STAGING: return LoggerLevel.WARNING;
        case AppEnvironment.PRODUCTION: return LoggerLevel.WARNING;
      }
    },
  })
  @IsOptional()
  @ToNumber()
  @IsNumber() @Min(0) @Max(8)
  public readonly CONSOLE_LEVEL: LoggerLevel;

}
