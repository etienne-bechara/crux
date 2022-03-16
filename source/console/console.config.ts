import { IsIn } from 'class-validator';

import { AppEnvironment } from '../app/app.enum';
import { Config, InjectSecret } from '../config/config.decorator';
import { LoggerSeverity } from '../logger/logger.enum';

@Config()
export class ConsoleConfig {

  @InjectSecret({
    fallback: (environment) => {
      switch (environment) {
        case AppEnvironment.LOCAL:return LoggerSeverity.TRACE;
        default: return LoggerSeverity.WARNING;
      }
    },
  })
  @IsIn(Object.values(LoggerSeverity))
  public readonly CONSOLE_SEVERITY: LoggerSeverity;

}
