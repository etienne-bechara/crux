import { LogSeverity } from '../log/log.enum';

export interface ConsoleOptions {
  /**
   * Console severity to enable publishing logs. Can be overridden by env `CONSOLE_SEVERITY`.
   * Default: `trace` when local`, otherwise `warning`.
   */
  severity?: LogSeverity;
  /**
   * Print logs in human friendly format.
   * Default: `true` for `local` environment, `false` otherwise.
   */
  pretty?: boolean;
   /** Applies indentation on stringified JSON data. */
  indentation?: number;
  /** Max length when stringifying details at console. */
  maxLength: number;
  /** Hide detailed data printed below each log message. */
  hideDetails?: boolean;
}
