import { LogSeverity } from '../log/log.enum';

export interface ConsoleOptions {
  /**
   * Console severity to enable publishing logs. Can be overridden by env `CONSOLE_SEVERITY`.
   * Default: `trace` when local`, otherwise `warning`.
   */
  severity?: LogSeverity;
  /** Format JSON when printing log details at console. */
  prettyPrint?: boolean;
  /** Max length when stringifying details at console. */
  maxLength: number;
  /** Hide detailed data printed below each log message. */
  hideDetails?: boolean;
}
