import { DiagLogger } from '@opentelemetry/api';

import { LogService } from '../log/log.service';

export class TraceDiagConsoleLogger implements DiagLogger {

  public constructor(
    private readonly logService: LogService,
  ) { }

  /**
   * Logs an error message.
   * @param message
   */
  public error(message: string): void {
    this.logService.error(message);
  }

  /**
   * Logs an warn message.
   * @param message
   */
  public warn(message: string): void {
    this.logService.warning(message);
  }

  /**
   * Logs an info message.
   * @param message
   */
  public info(message: string): void {
    this.logService.info(message);
  }

  /**
   * Logs an debug message.
   * @param message
   */
  public debug(message: string): void {
    this.logService.debug(message);
  }

  /**
   * Logs an verbose message.
   * @param message
   */
  public verbose(message: string): void {
    this.logService.trace(message);
  }

}
