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

export class TraceAppDiag {

  public constructor(
    private readonly logService: LogService,
  ) { }

  /**
   * Given a message to log, extracts its details.
   * @param msg
   */
  private extractMessageData(msg: string): { message: string; data?: Record<string, any> } {
    try {
      const data = JSON.parse(msg);
      const message = data?.message;
      delete data?.message;

      return { message, data };
    }
    catch {
      return { message: msg };
    }
  }

  /**
   * Logs trace errors as application warnings.
   * @param msg
   */
  public error(msg: string): void {
    return this.warn(msg);
  }

  /**
   * Logs trace warnings.
   * @param msg
   */
  public warn(msg: string): void {
    const { message, data } = this.extractMessageData(msg);
    this.logService.warning(message, data);
  }

}
