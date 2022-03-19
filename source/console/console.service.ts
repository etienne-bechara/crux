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
    this.loggerService.registerTransport(this);
  }

  /**
   * Returns minimum level for logging this transport.
   */
  public getSeverity(): LoggerSeverity {
    const { logger } = this.appConfig.APP_OPTIONS || { };
    const environment = this.appConfig.NODE_ENV;
    const envSeverity = environment === AppEnvironment.LOCAL ? LoggerSeverity.TRACE : LoggerSeverity.WARNING;
    return this.consoleConfig.CONSOLE_SEVERITY || logger.consoleSeverity || envSeverity;
  }

  /**
   * Logs a message on the console, if the environment is set
   * to LOCAL applies colorization based on severity.
   * @param params
   */
  // eslint-disable-next-line complexity
  public log(params: LoggerParams): void {
    const environment = this.appConfig.NODE_ENV;
    const { timestamp, severity, requestId, caller, message, data, error } = params;
    const { logger } = this.appConfig.APP_OPTIONS || { };
    const { consolePretty, consoleMaxLength } = logger;
    const isError = this.loggerService.isHigherOrEqualSeverity(severity, LoggerSeverity.ERROR);

    if (environment === AppEnvironment.LOCAL) {
      const strSeverity = severity.toUpperCase().padEnd(7, ' ');
      const strFilename = caller.padEnd(20, ' ');
      const strRequestId = requestId || '-'.repeat(10);
      const strData = JSON.stringify(data, null, consolePretty ? 2 : null);

      const slicedData = strData?.length > consoleMaxLength
        ? `${strData.slice(0, consoleMaxLength - 6)} [...]`
        : strData;

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
        + `${data ? `${gray}\n${slicedData}${reset}` : ''}`,
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
