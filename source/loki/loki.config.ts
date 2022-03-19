import { IsIn, IsNotEmpty, IsOptional, IsString, IsUrl } from 'class-validator';

import { Config, InjectSecret } from '../config/config.decorator';
import { LoggerSeverity } from '../logger/logger.enum';

@Config()
export class LokiConfig {

  @InjectSecret()
  @IsOptional()
  @IsUrl()
  public readonly LOKI_URL: string;

  @InjectSecret()
  @IsOptional()
  @IsString() @IsNotEmpty()
  public readonly LOKI_USERNAME: string;

  @InjectSecret()
  @IsOptional()
  @IsString() @IsNotEmpty()
  public readonly LOKI_PASSWORD: string;

  @InjectSecret()
  @IsOptional()
  @IsIn(Object.values(LoggerSeverity))
  public readonly LOKI_SEVERITY: LoggerSeverity;

  public readonly LOKI_EXCEPTION_MESSAGE = 'Failed to publish Loki batch';

}
