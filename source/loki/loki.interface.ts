import { LogSeverity } from '../log/log.enum';

export interface LokiOptions {
  /** Loki severity to enable publishing logs. Can be overridden by env `LOKI_SEVERITY`. Default: `debug`. */
  severity?: LogSeverity;
  /** Loki API URL to publish logs. Can be overridden by env `LOKI_URL`. */
  url?: string;
  /** Loki username to publish logs. Can be overridden by env `LOKI_USERNAME`. */
  username?: string;
  /** Loki password to publish logs. Can be overridden by env `LOKI_PASSWORD`. */
  password?: string;
  /** Loki API push interval in milliseconds. Default: 30000. */
  pushInterval?: number;
  /** Loki maximum batch size, will trigger a premature push if necessary. Default: 1000. */
  batchSize?: number;
}

export interface LokiPushParams {
  streams: LokiPushStream[];
}

export interface LokiPushStream {
  stream: Record<string, string>;
  values: string[][];
}
