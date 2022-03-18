import { IsIn, IsOptional } from 'class-validator';

import { Config, InjectSecret } from '../config/config.decorator';
import { LoggerSeverity } from '../logger/logger.enum';

@Config()
export class ConsoleConfig {

  @InjectSecret()
  @IsOptional()
  @IsIn(Object.values(LoggerSeverity))
  public readonly CONSOLE_SEVERITY: LoggerSeverity;

}
