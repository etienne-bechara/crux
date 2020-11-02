import { Injectable } from '@nestjs/common';
import cleanStack from 'clean-stack';
import { decycle } from 'cycle';

import { LoggerConfig } from './logger.config';
import { LoggerLevel } from './logger.enum';
import { LoggerParams, LoggerTransport } from './logger.interface';

@Injectable()
export class LoggerService {

  private transports: LoggerTransport[] = [ ];
  private pendingLogs: LoggerParams[] = [ ];

  public constructor(
    private readonly loggerConfig: LoggerConfig,
  ) {
    this.setupLogger();
  }

  /**
   * Adds an event listener to catch uncaught exceptions.
   */
  private setupLogger(): void {
    const env = this.loggerConfig.NODE_ENV;
    this.info(`Environment configured as ${env}`);

    process.on('uncaughtException', (err) => {
      this.error(err, { unexpected: true });
    });
  }

  /**
   * Given an already instantiated transport, check if it is
   * enabled for current environment and register it at the
   * array of publishers.
   * @param transport
   */
  public registerTransport(transport: LoggerTransport): void {
    const options = transport.getOptions();

    if (options?.level || options?.level === 0) {
      this.transports.push(transport);
    }
  }

  /**
   * Isolates incoming message, error and data, and publishes
   * the event to all registered transports with configured
   * severity equal or lower.
   * @param level
   * @param message
   * @param data
   */
  private log(level: LoggerLevel, message: string | Error, ...data: (Error | Record<string, any>)[]): void {
    const logBatch: LoggerParams[] = [ ...this.pendingLogs ];

    const logMessage = {
      level,
      message: this.getLogMessage(message),
      error: this.getLogError(message, ...data),
      data: this.getLogData(...data),
    };

    if (this.transports.length === 0) {
      this.pendingLogs.push(logMessage);
      return;
    }

    this.pendingLogs = [ ];
    logBatch.push(logMessage);

    for (const transport of this.transports) {
      const options = transport.getOptions();
      if (level > options.level) continue;

      for (const logRecord of logBatch) {
        transport.log(logRecord);
      }
    }
  }

  /**
   * Given an event to log, extract it message.
   * @param message
   */
  private getLogMessage(message: string | Error): string {
    return typeof message === 'string'
      ? message
      : message.message;
  }

  /**
   * Given an event to log, extract its error or exception.
   * If not available in provided argument, generate a new
   * Error object and remove top stack levels.
   * @param message
   * @param data
   */
  private getLogError(message: string | Error, ...data: (Error | Record<string, any>)[]): Error {
    let error = message instanceof Error ? message : undefined;

    if (!error) {
      for (const detail of data) {
        if (detail instanceof Error) error = detail;
      }

      if (!error) {
        error = new Error(message as string);
        error.stack = error.stack.split('\n').filter((e, i) => i < 1 || i > 3).join('\n');
      }
    }

    error.stack = cleanStack(error.stack);
    return error;
  }

  /**
   * Given an event to log, extract it details.
   * @param data
   */
  private getLogData(...data: (Error | Record<string, any>)[]): Record<string, any> {
    const dataRecords = data.filter((data) => !(data instanceof Error));
    let dataObject = { };

    for (const record of dataRecords) {
      dataObject = { ...dataObject, ...record };
    }

    return Object.keys(dataObject).length > 0
      ? decycle(dataObject)
      : undefined;
  }

  /**
   * Logs a CRITICAL event.
   * @param message
   * @param data
   */
  public critical(message: string | Error, ...data: (Error | Record<string, any>)[]): void {
    return this.log(LoggerLevel.CRITICAL, message, ...data);
  }

  /**
   * Logs an ERROR event.
   * @param message
   * @param data
   */
  public error(message: string | Error, ...data: (Error | Record<string, any>)[]): void {
    return this.log(LoggerLevel.ERROR, message, ...data);
  }

  /**
   * Logs a WARNING event.
   * @param message
   * @param data
   */
  public warning(message: string | Error, ...data: (Error | Record<string, any>)[]): void {
    return this.log(LoggerLevel.WARNING, message, ...data);
  }

  /**
   * Logs a NOTICE event.
   * @param message
   * @param data
   */
  public notice(message: string | Error, ...data: (Error | Record<string, any>)[]): void {
    return this.log(LoggerLevel.NOTICE, message, ...data);
  }

  /**
   * Logs an INFO event.
   * @param message
   * @param data
   */
  public info(message: string | Error, ...data: (Error | Record<string, any>)[]): void {
    return this.log(LoggerLevel.INFO, message, ...data);
  }

  /**
   * Logs a HTTP event.
   * @param message
   * @param data
   */
  public http(message: string | Error, ...data: (Error | Record<string, any>)[]): void {
    return this.log(LoggerLevel.HTTP, message, ...data);
  }

  /**
   * Logs a DEBUG event.
   * @param message
   * @param data
   */
  public debug(message: string | Error, ...data: (Error | Record<string, any>)[]): void {
    return this.log(LoggerLevel.DEBUG, message, ...data);
  }

}
