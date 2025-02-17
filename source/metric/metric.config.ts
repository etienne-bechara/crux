import { Config, InjectConfig } from '../config/config.decorator';
import { IsOptional, IsString, IsUrl } from '../validate/validate.decorator';
import { MetricHttpStrategy } from './metric.enum';
import { MetricOptions } from './metric.interface';

// eslint-disable-next-line @typescript-eslint/naming-convention
export const METRIC_DEFAULT_OPTIONS: MetricOptions = {
  pushInterval: 30_000,
  httpStrategy: MetricHttpStrategy.HISTOGRAM,
  httpPercentiles: [ 0.99, 0.95, 0.5 ],
  httpBuckets: [ 0.05, 0.1, 0.25, 0.5, 1, 2.5, 5, 10, 25, 50 ],
};

@Config()
export class MetricConfig {

  @InjectConfig()
  @IsOptional()
  @IsUrl()
  public readonly METRIC_URL?: string;

  @InjectConfig()
  @IsOptional()
  @IsString()
  public readonly METRIC_USERNAME?: string;

  @InjectConfig()
  @IsOptional()
  @IsString()
  public readonly METRIC_PASSWORD?: string;

}
