import { Injectable } from '@nestjs/common';
import * as Sentry from '@sentry/node';

import { AppConfig } from '../app/app.config';
import { LogSeverity } from '../log/log.enum';
import { LogParams, LogTransport } from '../log/log.interface';
import { LogService } from '../log/log.service';
import { SentryConfig } from './sentry.config';

@Injectable()
export class SentryService implements LogTransport {

  public constructor(
    private readonly appConfig: AppConfig,
    private readonly logService: LogService,
    private readonly sentryConfig: SentryConfig,
  ) {
    this.setupTransport();
  }

  /**
   * Creates a connection to Sentry transport, disables
   * the native uncaught exception integration since we
   * are customizing it at logger service.
   */
  private setupTransport(): void {
    const { sentry } = this.appConfig.APP_OPTIONS || { };
    const { dsn } = sentry;
    const sentryDsn = this.sentryConfig.SENTRY_DSN || dsn;

    if (!sentryDsn) {
      this.logService.info('Sentry transport disabled due to missing DSN');
      return;
    }

    Sentry.init({
      dsn: sentryDsn,
      environment: this.appConfig.NODE_ENV,
      integrations: (int) => int.filter((i) => i.name !== 'OnUncaughtException'),
    });

    this.logService.info(`Sentry transport connected at ${dsn}`);
    this.logService.registerTransport(this);
  }

  /**
   * Returns minimum level for logging this transport.
   */
  public getSeverity(): LogSeverity {
    const { sentry } = this.appConfig.APP_OPTIONS || { };
    const { severity } = sentry;
    return this.sentryConfig.SENTRY_SEVERITY || severity;
  }

  /**
   * Sends a log message to Sentry configuring
   * custom data and labels.
   * @param params
   */
  public log(params: LogParams): void {
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
  public getSentrySeverity(severity: LogSeverity): Sentry.Severity {
    switch (severity) {
      case LogSeverity.FATAL: return Sentry.Severity.Fatal;
      case LogSeverity.ERROR: return Sentry.Severity.Error;
      case LogSeverity.WARNING: return Sentry.Severity.Warning;
      case LogSeverity.NOTICE: return Sentry.Severity.Info;
      case LogSeverity.INFO: return Sentry.Severity.Info;
      case LogSeverity.HTTP: return Sentry.Severity.Debug;
      case LogSeverity.DEBUG: return Sentry.Severity.Debug;
      case LogSeverity.TRACE: return Sentry.Severity.Debug;
    }
  }

}
