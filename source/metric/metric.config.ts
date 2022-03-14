import { IsNotEmpty, IsOptional, IsString, IsUrl } from 'class-validator';

import { Config, InjectSecret } from '../config/config.decorator';

@Config()
export class MetricConfig {

  @InjectSecret()
  @IsOptional()
  @IsUrl()
  public readonly METRIC_PUSHGATEWAY_URL: string;

  @InjectSecret()
  @IsOptional()
  @IsString() @IsNotEmpty()
  public readonly METRIC_PUSHGATEWAY_USERNAME: string;

  @InjectSecret()
  @IsOptional()
  @IsString() @IsNotEmpty()
  public readonly METRIC_PUSHGATEWAY_PASSWORD: string;

}
