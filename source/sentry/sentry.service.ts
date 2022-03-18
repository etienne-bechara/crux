import { Injectable } from '@nestjs/common';
import * as Sentry from '@sentry/node';

import { AppConfig } from '../app/app.config';
import { LoggerSeverity } from '../logger/logger.enum';
import { LoggerParams, LoggerTransport } from '../logger/logger.interface';
import { LoggerService } from '../logger/logger.service';
import { SentryConfig } from './sentry.config';

@Injectable()
export class SentryService implements LoggerTransport {

  public constructor(
    private readonly appConfig: AppConfig,
    private readonly sentryConfig: SentryConfig,
    private readonly loggerService: LoggerService,
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

    if (!dsn) {
      this.loggerService.info('Sentry transport disabled due to missing DSN');
      return;
    }

    Sentry.init({
      dsn,
      environment: this.appConfig.NODE_ENV,
      integrations: (int) => int.filter((i) => i.name !== 'OnUncaughtException'),
    });

    this.loggerService.info(`Sentry transport connected at ${dsn}`);
    this.loggerService.registerTransport(this);
  }

  /**
   * Returns minimum level for logging this transport.
   */
  public getSeverity(): LoggerSeverity {
    return this.sentryConfig.SENTRY_SEVERITY;
  }

  /**
   * Sends a log message to Sentry configuring
   * custom data and labels.
   * @param params
   */
  public log(params: LoggerParams): void {
    const { severity, message, requestId, data, error: rawError } = params;
    const error = rawError || new Error(message);

    if (message !== error.message) {
      error.message = `${message} | ${error.message}`;
    }

    Sentry.withScope((scope) => {
      scope.setLevel(this.getSentrySeverity(severity));

      if (data?.unexpected) {
        scope.setTag('unexpected', 'true');
      }

      scope.setExtras({
        requestId,
        details: JSON.stringify(data || { }, null, 2),
      });

      Sentry.captureException(error);
    });
  }

  /**
   * Translates application log level into sentry severity.
   * @param severity
   */
  public getSentrySeverity(severity: LoggerSeverity): Sentry.Severity {
    switch (severity) {
      case LoggerSeverity.FATAL: return Sentry.Severity.Fatal;
      case LoggerSeverity.ERROR: return Sentry.Severity.Error;
      case LoggerSeverity.WARNING: return Sentry.Severity.Warning;
      case LoggerSeverity.NOTICE: return Sentry.Severity.Info;
      case LoggerSeverity.INFO: return Sentry.Severity.Info;
      case LoggerSeverity.HTTP: return Sentry.Severity.Debug;
      case LoggerSeverity.DEBUG: return Sentry.Severity.Debug;
      case LoggerSeverity.TRACE: return Sentry.Severity.Debug;
    }
  }

}
