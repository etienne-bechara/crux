import { Injectable } from '@nestjs/common';

import { AppEnvironment } from '../../../app/app.enum';
import { InjectSecret } from '../../../config/config.decorator';
import { LoggerConfig } from '../../logger.config';
import { LoggerLevel } from '../../logger.enum';

@Injectable()
export class ConsoleConfig extends LoggerConfig {

  @InjectSecret({
    default: (nodeEnv) => {
      switch (nodeEnv) {
        case AppEnvironment.LOCAL: return LoggerLevel.DEBUG;
        case AppEnvironment.DEVELOPMENT: return LoggerLevel.NOTICE;
        case AppEnvironment.STAGING: return LoggerLevel.WARNING;
        case AppEnvironment.PRODUCTION: return LoggerLevel.WARNING;
      }
    },
  })
  public readonly CONSOLE_LEVEL: LoggerLevel;

}
