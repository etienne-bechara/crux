import { Injectable } from '@nestjs/common';
import * as Sentry from '@sentry/node';

import { LoggerLevel } from '../../logger.enum';
import { LoggerParams, LoggerTransport } from '../../logger.interface';
import { LoggerService } from '../../logger.service';
import { SentryConfig } from './sentry.config';

@Injectable()
export class SentryService implements LoggerTransport {

  public constructor(
    protected readonly sentryConfig: SentryConfig,
    protected readonly loggerService: LoggerService,
  ) {
    this.setupTransport();
  }

  /**
   * Creates a connection to Sentry transport, disables
   * the native uncaught exception integration since we
   * are customizing it at logger service.
   */
  private setupTransport(): void {
    const dsn = this.sentryConfig.SENTRY_DSN;
    const level = this.getLevel();
    if (!level && level !== 0) return;

    if (!dsn) {
      setTimeout(() => this.loggerService.warning('[SentryService] Missing Sentry DSN'), 500);
      return;
    }

    Sentry.init({
      dsn,
      environment: this.sentryConfig.NODE_ENV,
      integrations: (int) => int.filter((i) => i.name !== 'OnUncaughtException'),
    });

    setTimeout(() => this.loggerService.notice(`[SentryService] Transport connected at ${dsn}`), 500);
    this.loggerService.registerTransport(this);
  }

  /**
   * Returns minimum level for logging this transport.
   */
  public getLevel(): LoggerLevel {
    return this.sentryConfig.SENTRY_LEVEL;
  }

  /**
   * Sends a log message to Sentry configuring
   * custom data and labels.
   * @param params
   */
  public log(params: LoggerParams): void {
    if (params.message !== params.error.message) {
      params.error.message = `${params.message}. ${params.error.message}`;
    }

    Sentry.withScope((scope) => {
      scope.setLevel(this.getSentrySeverity(params.level));
      if (params.data?.unexpected) scope.setTag('unexpected', 'true');
      scope.setExtras({
        details: JSON.stringify(params.data || { }, null, 2),
      });
      Sentry.captureException(params.error);
    });
  }

  /**
   * Translates application log level into sentry severity.
   * @param level
   */
  public getSentrySeverity(level: LoggerLevel): Sentry.Severity {
    switch (level) {
      case LoggerLevel.FATAL: return Sentry.Severity.Fatal;
      case LoggerLevel.CRITICAL: return Sentry.Severity.Critical;
      case LoggerLevel.ERROR: return Sentry.Severity.Error;
      case LoggerLevel.WARNING: return Sentry.Severity.Warning;
      case LoggerLevel.NOTICE: return Sentry.Severity.Info;
      case LoggerLevel.INFO: return Sentry.Severity.Info;
      case LoggerLevel.HTTP: return Sentry.Severity.Debug;
      case LoggerLevel.DEBUG: return Sentry.Severity.Debug;
      case LoggerLevel.TRACE: return Sentry.Severity.Debug;
    }
  }

}
