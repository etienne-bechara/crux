/* eslint-disable no-console */
import { Injectable } from '@nestjs/common';

import { AppConfig } from '../app/app.config';
import { AppEnvironment } from '../app/app.enum';
import { LoggerSeverity, LoggerStyle } from '../logger/logger.enum';
import { LoggerParams, LoggerTransport } from '../logger/logger.interface';
import { LoggerService } from '../logger/logger.service';
import { ConsoleConfig } from './console.config';

@Injectable()
export class ConsoleService implements LoggerTransport {

  public constructor(
    private readonly appConfig: AppConfig,
    private readonly consoleConfig: ConsoleConfig,
    private readonly loggerService: LoggerService,
  ) {
    this.setupTransport();
  }

  /**
   * Do not register the transport if severity is not provided.
   */
  private setupTransport(): void {
    const severity = this.getSeverity();
    if (!severity) return;

    this.loggerService.registerTransport(this);
  }

  /**
   * Returns minimum level for logging this transport.
   */
  public getSeverity(): LoggerSeverity {
    return this.consoleConfig.CONSOLE_SEVERITY;
  }

  /**
   * Logs a message on the console, if the environment is set
   * to LOCAL applies colorization based on severity.
   * @param params
   */
  // eslint-disable-next-line complexity
  public log(params: LoggerParams): void {
    const { environment, timestamp, severity, requestId, caller, message, data, error } = params;
    const { prettyPrint } = this.appConfig.APP_OPTIONS;
    const isError = this.loggerService.isHigherOrEqualSeverity(severity, LoggerSeverity.ERROR);

    if (environment === AppEnvironment.LOCAL) {
      const strSeverity = severity.toUpperCase().padEnd(7, ' ');
      const strFilename = caller.padEnd(20, ' ');
      const strRequestId = requestId || '-'.repeat(8);
      const strData = JSON.stringify(data, null, prettyPrint ? 2 : null);

      const gray = LoggerStyle.FG_BRIGHT_BLACK;
      const reset = LoggerStyle.RESET;
      const separator = `${gray} | ${reset}`;

      let severityColor: LoggerStyle;

      switch (severity) {
        case LoggerSeverity.FATAL: severityColor = LoggerStyle.FG_MAGENTA; break;
        case LoggerSeverity.ERROR: severityColor = LoggerStyle.FG_RED; break;
        case LoggerSeverity.WARNING: severityColor = LoggerStyle.FG_YELLOW; break;
        case LoggerSeverity.NOTICE: severityColor = LoggerStyle.FG_GREEN; break;
        case LoggerSeverity.INFO: severityColor = LoggerStyle.FG_WHITE; break;
        case LoggerSeverity.HTTP: severityColor = LoggerStyle.FG_BLUE; break;
        case LoggerSeverity.DEBUG: severityColor = LoggerStyle.FG_BRIGHT_BLACK; break;
        case LoggerSeverity.TRACE: severityColor = LoggerStyle.FG_BRIGHT_BLACK; break;
      }

      console[isError ? 'error' : 'log'](
        `${gray}${timestamp}${reset}${separator}`
        + `${severityColor}${strSeverity}${reset}${separator}`
        + `${severityColor}${strRequestId}${reset}${separator}`
        + `${severityColor}${strFilename}${reset}${separator}`
        + `${severityColor}${message}${reset}`
        + `${data ? `${gray}\n${strData}${reset}` : ''}`,
      );

      if (error) {
        const { message, stack } = error;
        console.error(`${severityColor}${message}${reset}${gray}\n${stack}${reset}`);
      }
    }
    else {
      console[isError ? 'error' : 'log'](JSON.stringify(params));
    }
  }

}
