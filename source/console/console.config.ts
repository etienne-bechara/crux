import { Config, InjectConfig } from '../config/config.decorator';
import { LogSeverity } from '../log/log.enum';
import { IsEnum, IsOptional } from '../validate/validate.decorator';
import { ConsoleOptions } from './console.interface';

export const CONSOLE_DEFAULT_OPTIONS: ConsoleOptions = {
  maxLength: 1000,
};

@Config()
export class ConsoleConfig {
  @InjectConfig()
  @IsOptional()
  @IsEnum(LogSeverity)
  public readonly CONSOLE_SEVERITY?: LogSeverity;
}
