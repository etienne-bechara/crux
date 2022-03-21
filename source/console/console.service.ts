/* eslint-disable no-console */
import { Injectable } from '@nestjs/common';

import { AppConfig } from '../app/app.config';
import { AppEnvironment } from '../app/app.enum';
import { LogSeverity, LogStyle } from '../log/log.enum';
import { LogParams, LogTransport } from '../log/log.interface';
import { LogService } from '../log/log.service';
import { ConsoleConfig } from './console.config';

@Injectable()
export class ConsoleService implements LogTransport {

  public constructor(
    private readonly appConfig: AppConfig,
    private readonly consoleConfig: ConsoleConfig,
    private readonly logService: LogService,
  ) {
    this.logService.registerTransport(this);
  }

  /**
   * Returns minimum level for logging this transport.
   */
  public getSeverity(): LogSeverity {
    const { console: consoleOptions } = this.appConfig.APP_OPTIONS || { };
    const { severity } = consoleOptions;

    const environment = this.appConfig.NODE_ENV;
    const envSeverity = environment === AppEnvironment.LOCAL ? LogSeverity.TRACE : LogSeverity.WARNING;

    return this.consoleConfig.CONSOLE_SEVERITY || severity || envSeverity;
  }

  /**
   * Logs a message on the console, if the environment is set
   * to LOCAL applies colorization based on severity.
   * @param params
   */
  // eslint-disable-next-line complexity
  public log(params: LogParams): void {
    const environment = this.appConfig.NODE_ENV;
    const { timestamp, severity, requestId, caller, message, data, error } = params;
    const { console: consoleOptions } = this.appConfig.APP_OPTIONS || { };
    const { prettyPrint, maxLength, hideDetails } = consoleOptions;
    const isError = this.logService.isHigherOrEqualSeverity(severity, LogSeverity.ERROR);

    if (environment === AppEnvironment.LOCAL) {
      const strSeverity = severity.toUpperCase().padEnd(7, ' ');
      const strRequestId = requestId?.slice(0, 6) || '-'.repeat(6);
      const strData = JSON.stringify(data, null, prettyPrint ? 2 : null);

      const strFilename = caller.length > 25
        ? `${caller.slice(0, 11)}...${caller.slice(-11)}`
        : caller.padEnd(25, ' ');

      const slicedData = strData?.length > maxLength
        ? `${strData.slice(0, maxLength - 6)} [...]`
        : strData;

      const gray = LogStyle.FG_BRIGHT_BLACK;
      const reset = LogStyle.RESET;
      const separator = `${gray} | ${reset}`;

      let severityColor: LogStyle;

      switch (severity) {
        case LogSeverity.FATAL: severityColor = LogStyle.FG_MAGENTA; break;
        case LogSeverity.ERROR: severityColor = LogStyle.FG_RED; break;
        case LogSeverity.WARNING: severityColor = LogStyle.FG_YELLOW; break;
        case LogSeverity.NOTICE: severityColor = LogStyle.FG_GREEN; break;
        case LogSeverity.INFO: severityColor = LogStyle.FG_WHITE; break;
        case LogSeverity.HTTP: severityColor = LogStyle.FG_BLUE; break;
        case LogSeverity.DEBUG: severityColor = LogStyle.FG_BRIGHT_BLACK; break;
        case LogSeverity.TRACE: severityColor = LogStyle.FG_BRIGHT_BLACK; break;
      }

      console[isError ? 'error' : 'log'](
        `${gray}${timestamp}${reset}${separator}`
        + `${severityColor}${strSeverity}${reset}${separator}`
        + `${severityColor}${strRequestId}${reset}${separator}`
        + `${severityColor}${strFilename}${reset}${separator}`
        + `${severityColor}${message}${reset}`
        + `${data && !hideDetails ? `${gray}\n${slicedData}${reset}` : ''}`,
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
