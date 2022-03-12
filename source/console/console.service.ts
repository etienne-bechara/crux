/* eslint-disable no-console */
import { Injectable } from '@nestjs/common';

import { AppConfig } from '../app/app.config';
import { AppEnvironment } from '../app/app.enum';
import { LoggerLevel, LoggerStyle } from '../logger/logger.enum';
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
  public getLevel(): LoggerLevel {
    return this.consoleConfig.CONSOLE_LEVEL;
  }

  /**
   * Logs a message on the console, if the environment is set
   * to LOCAL applies colorization based on severity.
   * @param params
   */
  // eslint-disable-next-line complexity
  public log(params: LoggerParams): void {
    const { environment, timestamp, level, requestId, caller, message, data, error } = params;
    const { prettyPrint } = this.appConfig.APP_OPTIONS;
    const isError = this.loggerService.isHigherOrEqualSeverity(level, LoggerLevel.ERROR);

    const strTimestamp = timestamp.replace('T', ' ').replace('Z', '');
    const strLevel = level.toUpperCase().padEnd(7, ' ');
    const strFilename = caller.padEnd(20, ' ');
    const strRequestId = requestId || '-'.repeat(8);
    const strData = JSON.stringify(data, null, prettyPrint ? 2 : null);

    if (environment === AppEnvironment.LOCAL) {
      const gray = LoggerStyle.FG_BRIGHT_BLACK;
      const reset = LoggerStyle.RESET;
      const separator = `${gray} | ${reset}`;

      let levelColor: LoggerStyle;

      switch (level) {
        case LoggerLevel.FATAL: levelColor = LoggerStyle.FG_MAGENTA; break;
        case LoggerLevel.ERROR: levelColor = LoggerStyle.FG_RED; break;
        case LoggerLevel.WARNING: levelColor = LoggerStyle.FG_YELLOW; break;
        case LoggerLevel.NOTICE: levelColor = LoggerStyle.FG_GREEN; break;
        case LoggerLevel.INFO: levelColor = LoggerStyle.FG_WHITE; break;
        case LoggerLevel.HTTP: levelColor = LoggerStyle.FG_BLUE; break;
        case LoggerLevel.DEBUG: levelColor = LoggerStyle.FG_BRIGHT_BLACK; break;
        case LoggerLevel.TRACE: levelColor = LoggerStyle.FG_BRIGHT_BLACK; break;
      }

      console[isError ? 'error' : 'log'](
        `${gray}${strTimestamp}${reset}${separator}`
        + `${levelColor}${strLevel}${reset}${separator}`
        + `${levelColor}${strRequestId}${reset}${separator}`
        + `${levelColor}${strFilename}${reset}${separator}`
        + `${levelColor}${message}${reset}`
        + `${data ? `${gray}\n${strData}${reset}` : ''}`,
      );

      if (error) {
        const { message, stack } = error;
        console.error(`${levelColor}${message}${reset}${gray}\n${stack}${reset}`);
      }
    }
    else {
      const separator = ' | ';

      console[isError ? 'error' : 'log'](
        `${strTimestamp}${separator}`
        + `${strLevel}${separator}`
        + `${strRequestId}${separator}`
        + `${strFilename}${separator}`
        + `${message}`
        + `${data ? `\n${strData}` : ''}`,
      );

      if (error) {
        console.error(error);
      }
    }
  }

}
