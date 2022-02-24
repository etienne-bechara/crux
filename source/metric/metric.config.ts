import { Config } from '../config/config.decorator';

@Config()
export class MetricConfig {

  public readonly METRIC_HTTP_DEFAULT_LABELS = [
    'method',
    'path',
    'status',
  ];

  public readonly METRIC_HTTP_DEFAULT_BUCKETS = [
    100,
    200,
    300,
    500,
    700,
    1000,
    2000,
    3000,
    5000,
    7000,
    10_000,
    20_000,
    30_000,
    50_000,
    70_000,
  ];

}
