import { IsIn, IsOptional } from 'class-validator';

import { Config, InjectSecret } from '../config/config.decorator';
import { LoggerSeverity } from '../logger/logger.enum';

@Config()
export class CsvConfig {

  @InjectSecret()
  @IsOptional()
  @IsIn(Object.values(LoggerSeverity))
  public readonly CSV_SEVERITY: LoggerSeverity;

  public readonly CSV_HEADER = 'timestamp,environment,severity,requestId,caller,message,data';
  public readonly CSV_DIRECTORY = './logs';
  public readonly CSV_EXCEPTION_MESSAGE = 'Failed to persist log data';
  public readonly CSV_DEFAULT_READ_HOURS = 8;

}
