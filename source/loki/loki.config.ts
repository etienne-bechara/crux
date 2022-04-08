import { IsIn, IsNotEmpty, IsOptional, IsString, IsUrl } from 'class-validator';

import { Config, InjectConfig } from '../config/config.decorator';
import { LogSeverity } from '../log/log.enum';

@Config()
export class LokiConfig {

  @InjectConfig()
  @IsOptional()
  @IsUrl()
  public readonly LOKI_URL: string;

  @InjectConfig()
  @IsOptional()
  @IsString() @IsNotEmpty()
  public readonly LOKI_USERNAME: string;

  @InjectConfig()
  @IsOptional()
  @IsString() @IsNotEmpty()
  public readonly LOKI_PASSWORD: string;

  @InjectConfig()
  @IsOptional()
  @IsIn(Object.values(LogSeverity))
  public readonly LOKI_SEVERITY: LogSeverity;

}
