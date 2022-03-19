import { HttpException, Injectable } from '@nestjs/common';
import cycle from 'cycle';

import { AppConfig } from '../app/app.config';
import { ContextService } from '../context/context.service';
import { LoggerSeverity } from './logger.enum';
import { LoggerArguments, LoggerParams, LoggerTransport } from './logger.interface';

@Injectable()
export class LoggerService {

  private transports: LoggerTransport[] = [ ];

  public constructor(
    private readonly appConfig: AppConfig,
    private readonly contextService: ContextService,
  ) {
    this.setupLogger();
  }

  /**
   * Adds an event listener to catch uncaught exceptions.
   */
  private setupLogger(): void {
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
    const severity = transport.getSeverity();

    if (severity) {
      this.transports.push(transport);
    }
  }

  /**
   * Isolates incoming message, error and data, and publishes
   * the event to all registered transports with configured
   * severity equal or lower.
   * @param severity
   * @param args
   */
  private log(severity: LoggerSeverity, ...args: LoggerArguments[]): void {
    const logMessage: LoggerParams = {
      timestamp: new Date().toISOString(),
      severity,
      requestId: this.contextService.getRequestId(),
      caller: this.getCaller(...args),
      message: this.getLogMessage(...args),
      data: this.getLogData(...args),
      error: this.getLogError(...args),
    };

    for (const transport of this.transports) {
      const transportSeverity = transport.getSeverity();
      const isHigher = this.isHigherOrEqualSeverity(severity, transportSeverity);

      if (isHigher) {
        transport.log(logMessage);
      }
    }
  }

  /**
   * Checks if `a` severity is equal or higher than `b`.
   * @param a
   * @param b
   */
  public isHigherOrEqualSeverity(a: LoggerSeverity, b: LoggerSeverity): boolean {
    const severity = [
      LoggerSeverity.FATAL,
      LoggerSeverity.ERROR,
      LoggerSeverity.WARNING,
      LoggerSeverity.NOTICE,
      LoggerSeverity.INFO,
      LoggerSeverity.HTTP,
      LoggerSeverity.DEBUG,
      LoggerSeverity.TRACE,
    ];

    return severity.indexOf(a) <= severity.indexOf(b);
  }

  /**
   * Acquires log caller, which includes filename and line.
   * @param args
   */
  private getCaller(...args: LoggerArguments[]): string {
    const error = args.find((a) => a instanceof Error) as Error || new Error('-');
    const matches = error.stack.matchAll(/at .*[/\\](.+?\.(?:js|ts):\d+):/g);

    for (const match of matches) {
      const filename = match[1].replace(/\.(?:js|ts):/, ':');

      if (!filename.includes('logger.service')) {
        return filename;
      }
    }

    return '';
  }

  /**
   * Consider the log message the first instance of a lone string
   * or of an object containing `message` property.
   * @param args
   */
  private getLogMessage(...args: LoggerArguments[]): string {
    for (const arg of args) {
      if (typeof arg === 'string') {
        return arg;
      }
      else if (arg?.message) {
        return arg.message;
      }
    }
  }

  /**
   * Given an event to log, extract it details.
   * @param args
   */
  private getLogData(...args: LoggerArguments[]): Record<string, any> {
    let data: Record<string, any> = { };

    for (const arg of args) {
      if (arg instanceof HttpException) {
        const details = arg.getResponse();
        const detailsObj = typeof details === 'string' ? { details } : details;
        data = { ...data, ...detailsObj };
      }
      else if (typeof arg === 'object') {
        data = { ...data, ...arg };
      }
    }

    return Object.keys(data).length > 0
      ? this.sanitize(data)
      : undefined;
  }

  /**
   * Acquire an error instance associated with log record.
   * @param args
   */
  private getLogError(...args: LoggerArguments[]): Error {
    return args.find((a) => a instanceof Error) as unknown as Error;
  }

  /**
   * Check if object has any keys matching blacklist and remove them.
   * If any key value is undefined, delete it.
   * @param object
   * @param decycled
   */
  // eslint-disable-next-line complexity
  public sanitize(object: any, decycled: boolean = false): any {
    const { logger } = this.appConfig.APP_OPTIONS || { };
    const { sensitiveKeys } = logger;

    if (typeof object !== 'object') {
      return object;
    }

    if (!decycled) {
      object = cycle.decycle(object);
    }

    if (Array.isArray(object)) {
      const clone = [ ...object ];
      return clone.map((o) => this.sanitize(o, true));
    }

    const clone = { ...object };

    for (const key in clone) {
      const alphaKey = key.toLowerCase().replace(/[^a-z]+/g, '');
      const isSensitive = sensitiveKeys.includes(alphaKey);
      const isArray = Array.isArray(clone[key]);
      const isObject = typeof clone[key] === 'object';
      const hasZeroKey = isObject && clone[key] && (clone[key]['0'] || clone[key]['0'] === 0);

      if (clone[key] === undefined) {
        delete clone[key];
      }
      else if (clone[key] === null) {
        continue;
      }
      else if (isSensitive) {
        clone[key] = '[filtered]';
      }
      else if (isArray || isObject && !hasZeroKey) {
        clone[key] = this.sanitize(clone[key], true);
      }
      else if (isObject && hasZeroKey) {
        clone[key] = '<Buffer>';
      }
    }

    return clone;
  }

  /**
   * Logs a FATAL event.
   * @param args
   */
  public fatal(...args: LoggerArguments[]): void {
    return this.log(LoggerSeverity.FATAL, ...args);
  }

  /**
   * Logs an ERROR event.
   * @param args
   */
  public error(...args: LoggerArguments[]): void {
    return this.log(LoggerSeverity.ERROR, ...args);
  }

  /**
   * Logs a WARN event.
   * @param args
   */
  public warning(...args: LoggerArguments[]): void {
    return this.log(LoggerSeverity.WARNING, ...args);
  }

  /**
   * Logs an NOTICE event.
   * @param args
   */
  public notice(...args: LoggerArguments[]): void {
    return this.log(LoggerSeverity.NOTICE, ...args);
  }

  /**
   * Logs an INFO event.
   * @param args
   */
  public info(...args: LoggerArguments[]): void {
    return this.log(LoggerSeverity.INFO, ...args);
  }

  /**
   * Logs a HTTP event.
   * @param args
   */
  public http(...args: LoggerArguments[]): void {
    return this.log(LoggerSeverity.HTTP, ...args);
  }

  /**
   * Logs a DEBUG event.
   * @param args
   */
  public debug(...args: LoggerArguments[]): void {
    return this.log(LoggerSeverity.DEBUG, ...args);
  }

  /**
   * Logs a TRACE event.
   * @param args
   */
  public trace(...args: LoggerArguments[]): void {
    return this.log(LoggerSeverity.TRACE, ...args);
  }

}
