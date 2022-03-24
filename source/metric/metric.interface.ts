export interface MetricOptions {
  /** Prefix for default metrics. */
  defaultPrefix?: string;
  /** Labels for default metrics. */
  defaultLabels?: Record<string, string>;
  /** Buckets for default metrics histograms. */
  defaultBuckets?: number[];
  /** Buckets for HTTP duration metrics histograms. */
  httpDurationBuckets?: number[];
  /** Prometheus Pushgateway API URL to publish metrics. Can be overridden by env `METRIC_URL`. */
  url?: string;
  /** Prometheus Pushgateway username to publish metrics. Can be overridden by env `METRIC_USERNAME`. */
  username?: string;
  /** Prometheus Pushgateway password to publish metrics. Can be overridden by env `METRIC_PASSWORD`. */
  password?: string;
  /** Prometheus Pushgateway API push interval in milliseconds. Default: 20000. */
  pushInterval?: number;
}
