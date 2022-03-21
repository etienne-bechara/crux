import { IsNotEmpty, IsOptional, IsString, IsUrl } from 'class-validator';

import { Config, InjectConfig } from '../config/config.decorator';

@Config()
export class MetricConfig {

  @InjectConfig()
  @IsOptional()
  @IsUrl()
  public readonly METRIC_URL: string;

  @InjectConfig()
  @IsOptional()
  @IsString() @IsNotEmpty()
  public readonly METRIC_USERNAME: string;

  @InjectConfig()
  @IsOptional()
  @IsString() @IsNotEmpty()
  public readonly METRIC_PASSWORD: string;

}
