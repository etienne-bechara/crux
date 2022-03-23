import { LogService } from '../log/log.service';

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

/**
 * Implements a custom wrapper to translate trace erros as warnings.
 */
export class TraceAppDiag {

  public constructor(
    private readonly logService: LogService,
  ) { }

  /**
   * Logs trace errors as application warnings.
   * @param msg
   */
  public error(msg: string): void {
    this.logService.warning(msg);
  }

  /**
   * Logs trace warnings.
   * @param msg
   */
  public warn(msg: string): void {
    this.logService.warning(msg);
  }

}
