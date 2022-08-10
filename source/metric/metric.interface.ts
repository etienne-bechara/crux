import { MetricPushType } from './metric.enum';

export interface MetricOptions {
  /** Prefix for default metrics. */
  defaultPrefix?: string;
  /** Labels for default metrics. */
  defaultLabels?: Record<string, string>;
  /** Buckets for default metrics histograms. */
  defaultBuckets?: number[];
  /** Buckets for HTTP duration metrics histograms. */
  httpDurationBuckets?: number[];
  /**
   * Prometheus API URL to publish metrics. Supports `:job` and `:instance`
   * for path replacements. Can be overridden by env `METRIC_URL`.
   */
  url?: string;
  /** Prometheus username to publish metrics. Can be overridden by env `METRIC_USERNAME`. */
  username?: string;
  /** Prometheus password to publish metrics. Can be overridden by env `METRIC_PASSWORD`. */
  password?: string;
  /** Prometheus API push interval in milliseconds. Default: 60000. */
  pushInterval?: number;
  /** Prometheus push type. Default: PUSHGATEWAY. */
  pushType?: MetricPushType;
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

export interface MetricPushTimeseries {
  timeseries: MetricTimeseries[];
}
