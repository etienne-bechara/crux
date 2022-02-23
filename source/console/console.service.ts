/* eslint-disable no-console */
import { Injectable } from '@nestjs/common';

import { AppEnvironment } from '../app/app.enum';
import { LoggerLevel, LoggerStyle } from '../logger/logger.enum';
import { LoggerParams, LoggerTransport } from '../logger/logger.interface';
import { LoggerService } from '../logger/logger.service';
import { ConsoleConfig } from './console.config';

@Injectable()
export class ConsoleService implements LoggerTransport {

  private chalk: any;

  public constructor(
    protected readonly consoleConfig: ConsoleConfig,
    protected readonly loggerService: LoggerService,
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
  public log(params: LoggerParams): void {
    const { environment, timestamp, level, filename, message, data, error } = params;
    const isError = this.loggerService.isHigherOrEqualSeverity(level, LoggerLevel.ERROR);

    const strTimestamp = timestamp.replace('T', ' ').replace('Z', '');
    const strLevel = level.toUpperCase().padEnd(7, ' ');
    const strFilename = filename.padEnd(20, ' ');

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
        + `${levelColor}${strFilename}${reset}${separator}`
        + `${levelColor}${message}${reset}`
        + `${data ? `${gray}\n${JSON.stringify(data, null, 2)}${reset}` : ''}`,
      );
    }
    else {
      const separator = ' | ';

      console[isError ? 'error' : 'log'](
        `${strTimestamp}${separator}`
        + `${strLevel}${separator}`
        + `${strFilename}${separator}`
        + `${message}`
        + `${data ? ` ${JSON.stringify(data)} ` : ''}`,
      );
    }

    if (error) {
      console.error(error);
    }
  }

}
