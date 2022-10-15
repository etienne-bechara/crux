import { IsIn, IsOptional } from 'class-validator';

import { Config, InjectConfig } from '../config/config.decorator';
import { LogSeverity } from '../log/log.enum';
import { ConsoleOptions } from './console.interface';

// eslint-disable-next-line @typescript-eslint/naming-convention
export const CONSOLE_DEFAULT_OPTIONS: ConsoleOptions = {
  maxLength: 1000,
};

@Config()
export class ConsoleConfig {

  @InjectConfig()
  @IsOptional()
  @IsIn(Object.values(LogSeverity))
  public readonly CONSOLE_SEVERITY: LogSeverity;

}
