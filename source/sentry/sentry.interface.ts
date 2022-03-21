import { LogSeverity } from '../log/log.enum';

export interface SentryOptions {
  /** Sentry severity to enable publishing logs. Can be overridden by env `SENTRY_SEVERITY`. Default: `error`. */
  severity?: LogSeverity;
  /** Sentry DSN to publish logs. Can be overridden by env `SENTRY_DSN`. */
  dsn?: string;
}
