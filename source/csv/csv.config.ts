import { IsIn, IsNumber, Min } from 'class-validator';

import { Config, InjectSecret } from '../config/config.decorator';
import { LoggerSeverity } from '../logger/logger.enum';
import { ToNumber } from '../transform/transform.decorator';

@Config()
export class CsvConfig {

  @InjectSecret({ fallback: '7' })
  @ToNumber()
  @IsNumber() @Min(1)
  public readonly CSV_MAX_AGE: number;

  @InjectSecret({ fallback: LoggerSeverity.HTTP })
  @IsIn(Object.values(LoggerSeverity))
  public readonly CSV_SEVERITY: LoggerSeverity;

  public readonly CSV_HEADER = '"timestamp","environment","severity","requestId","caller","message","data"';
  public readonly CSV_DIRECTORY = './logs';
  public readonly CSV_EXCEPTION_MESSAGE = 'Failed to persist log data';
  public readonly CSV_DEFAULT_READ_HOURS = 8;

}
