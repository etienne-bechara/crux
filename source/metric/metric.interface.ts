export interface MetricOptions {
  /** Job name to label on every metric as well as pushing to gateway. */
  job?: string;
  /** Prefix for default metrics. */
  defaultPrefix?: string;
  /** Labels for default metrics. */
  defaultLabels?: Record<string, string>;
  /** Buckets for default metrics histograms. */
  defaultBuckets?: number[];
  /** Buckets for HTTP metrics histograms. */
  httpBuckets?: number[];
  /** URL of gateway to push metrics. */
  pushgatewayUrl?: string;
  /** Pushgateway basic auth username. */
  pushgatewayUsername?: string;
  /** Pushgateway basic auth password. */
  pushgatewayPassword?: string;
  /** Interval in milliseconds to push data to gateway. */
  pushgatewayInterval?: number;
  /** Whether or not to reset instance metrics when pushing to gateway. */
  pushgatewayReset?: boolean;
}
