export interface MetricOptions {
  /** Prefix for default metrics. */
  defaultPrefix?: string;
  /** Labels for default metrics. */
  defaultLabels?: Record<string, string>;
  /** Buckets for default metrics histograms. */
  defaultBuckets?: number[];
  /** Buckets for HTTP metrics histograms. */
  httpBuckets?: number[];
  /** URL of gateway to push metrics. */
  url?: string;
  /** Pushgateway basic auth username. */
  username?: string;
  /** Pushgateway basic auth password. */
  password?: string;
  /** Interval in milliseconds to push data to gateway. */
  pushInterval?: number;
}
