export interface MetricOptions {
  /** Prefix for default metrics. */
  defaultPrefix?: string;
  /** Labels for default metrics. */
  defaultLabels?: Record<string, string>;
  /** Buckets for default metrics histograms. */
  defaultBuckets?: number[];
  /** Buckets for HTTP metrics histograms. */
  httpBuckets?: number[];
  /** Address of gateway to push metrics. */
  pushgatewayHost?: string;
  /** Job name when pushing data to gateway. */
  pushgatewayJob?: string;
  /** Interval in milliseconds to push data to gateway. */
  pushgatewayInterval?: number;
}
