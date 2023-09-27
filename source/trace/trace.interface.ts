export interface TraceOptions {
  /** Open Telemetry API URL to publish traces. Can be overridden by env `TRACE_URL`. */
  url?: string;
  /** Open Telemetry username to publish traces. Can be overridden by env `TRACE_USERNAME`. */
  username?: string;
  /** Open Telemetry password to publish traces. Can be overridden by env `TRACE_PASSWORD`. */
  password?: string;
  /** Open Telemetry API push interval in milliseconds. Default: 5s. */
  pushInterval?: number;
  /** Open Telemetry maximum batch size, will drop spans if queued over 10 times. Default: 1000. */
  batchSize?: number;
  /** Open Telemetry percentage of sampled traces, only applicable for spans without a root. Default: 1. */
  samplerRatio?: number;
}
