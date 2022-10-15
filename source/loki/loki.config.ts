import { IsIn, IsNotEmpty, IsOptional, IsString, IsUrl } from 'class-validator';

import { Config, InjectConfig } from '../config/config.decorator';
import { LogSeverity } from '../log/log.enum';
import { LokiOptions } from './loki.interface';

// eslint-disable-next-line @typescript-eslint/naming-convention
export const LOKI_DEFAULT_OPTIONS: LokiOptions = {
  severity: LogSeverity.HTTP,
  pushInterval: 60_000,
  batchSize: 1000,
};

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
