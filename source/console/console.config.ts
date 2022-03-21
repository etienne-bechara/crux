import { IsIn, IsOptional } from 'class-validator';

import { Config, InjectConfig } from '../config/config.decorator';
import { LogSeverity } from '../log/log.enum';

@Config()
export class ConsoleConfig {

  @InjectConfig()
  @IsOptional()
  @IsIn(Object.values(LogSeverity))
  public readonly CONSOLE_SEVERITY: LogSeverity;

}
