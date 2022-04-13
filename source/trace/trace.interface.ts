
export interface TraceOptions {
  /** Open Telemetry API URL to publish traces. Can be overridden by env `TRACE_URL`. */
  url?: string;
  /** Open Telemetry username to publish traces. Can be overridden by env `TRACE_USERNAME`. */
  username?: string;
  /** Open Telemetry password to publish traces. Can be overridden by env `TRACE_PASSWORD`. */
  password?: string;
  /** Open Telemetry API push interval in milliseconds. Default: 20000. */
  pushInterval?: number;
}
