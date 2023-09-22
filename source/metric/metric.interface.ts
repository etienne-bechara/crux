import { HttpStatus } from '@nestjs/common';

import { AppTraffic } from '../app/app.enum';
import { CacheStatus } from '../cache/cache.enum';
import { HttpMethod } from '../http/http.enum';
import { MetricHttpStrategy } from './metric.enum';

export interface MetricOptions {
  /** Prefix for default metrics. */
  defaultPrefix?: string;
  /** Labels for default metrics. */
  defaultLabels?: Record<string, string>;
  /** Buckets for default metrics histograms. */
  defaultBuckets?: number[];
  /** Filter built-in collected metrics to report in order to reduce amount of timeseries. */
  defaultFilter?: string[];
  /** Data type strategy when collecting HTTP timeseries. Default: SUMMARY.*/
  httpStrategy?: MetricHttpStrategy;
  /** [SUMMARY Strategy] Percentiles to measure for HTTP metrics. Default: [ 0.99, 0.95, 0.5 ]. */
  httpPercentiles?: number[];
  /**
   * [HISTOGRAM Strategy] Duration buckets to distribute HTTP metrics.
   * Default: [ 0.05, 0.1, 0.25, 0.5, 1, 2.5, 5, 10, 25, 50 ].
   */
  httpBuckets?: number[];
  /** Bin HTTP status codes to near hundred, therefore resulting in 2xx, 4xx, etc. Default: `false`. */
  httpCodeBin?: boolean;
  /**
   * Prometheus API URL to publish metrics. Supports `:job` and `:instance`
   * for path replacements. Can be overridden by env `METRIC_URL`.
   */
  url?: string;
  /** Prometheus username to publish metrics. Can be overridden by env `METRIC_USERNAME`. */
  username?: string;
  /** Prometheus password to publish metrics. Can be overridden by env `METRIC_PASSWORD`. */
  password?: string;
  /** Prometheus API push interval in milliseconds. Default: 30s. */
  pushInterval?: number;
}

export interface MetricHttpDurationParams {
  traffic: AppTraffic;
  method: HttpMethod;
  host: string;
  path: string;
  code: HttpStatus;
  cache: CacheStatus;
  duration: number;
}

export interface MetricLabel {
  name: string;
  value: string;
}

export interface MetricSample {
  timestamp: number;
  value: number;
}

export interface MetricTimeseries {
  labels: MetricLabel[];
  samples: MetricSample[];
}

export interface MetricMessage {
  timeseries: MetricTimeseries[];
}
