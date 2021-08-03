/* eslint-disable no-console */
import { Injectable } from '@nestjs/common';

import { LoggerLevel } from '../../logger.enum';
import { LoggerParams, LoggerTransport } from '../../logger.interface';
import { LoggerService } from '../../logger.service';
import { ConsoleConfig } from './console.config';
import { ConsoleStyle } from './console.interface';

@Injectable()
export class ConsoleService implements LoggerTransport {

  private chalk: any;

  public constructor(
    protected readonly consoleConfig: ConsoleConfig,
    protected readonly loggerService: LoggerService,
  ) {
    this.loggerService.registerTransport(this);

    // To enable colored log you must have chalk installed as devDependency
    try {
      // eslint-disable-next-line unicorn/prefer-module
      this.chalk = require('chalk');
    }
    catch {
      /* Ignore */
    }
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
    const sty = this.getStyle(params.level);
    const now = this.getLocalTime();

    // Colored
    if (this.chalk) {
      const msg = this.chalk`{grey ${now}} {${sty.labelColor}  ${sty.label} } {${sty.messageColor} ${params.message}}`;
      console.log(msg);

      if (params.error && params.level <= LoggerLevel.ERROR) {
        console.log(this.chalk`{grey ${params.error.stack}}`);
      }

    // Standard
    }
    else {
      const msg = `${now} ${sty.label} ${params.message}`;

      if (params.level <= LoggerLevel.ERROR) {
        console.error(msg);
        console.log(params.error);
      }
      else {
        console.log(msg);
      }
    }

    if (params.data) console.log(params.data);
  }

  /**
   * Given a level, returns its matching color style
   * (effective on LOCAL environment only).
   * @param level
   */
  private getStyle(level: LoggerLevel): ConsoleStyle {
    switch (level) {
      case LoggerLevel.FATAL:
        return { label: 'FTL', labelColor: 'white.bgRedBright', messageColor: 'redBright' };
      case LoggerLevel.CRITICAL:
        return { label: 'CRT', labelColor: 'white.bgRedBright', messageColor: 'redBright' };
      case LoggerLevel.ERROR:
        return { label: 'ERR', labelColor: 'black.bgRed', messageColor: 'red' };
      case LoggerLevel.WARNING:
        return { label: 'WRN', labelColor: 'black.bgYellow', messageColor: 'yellow' };
      case LoggerLevel.NOTICE:
        return { label: 'NTC', labelColor: 'black.bgGreen', messageColor: 'green' };
      case LoggerLevel.INFO:
        return { label: 'INF', labelColor: 'black.bgWhite', messageColor: 'white' };
      case LoggerLevel.HTTP:
        return { label: 'HTP', labelColor: 'black.bgBlue', messageColor: 'blue' };
      case LoggerLevel.DEBUG:
        return { label: 'DBG', labelColor: 'black.bgBlackBright', messageColor: 'blackBright' };
      case LoggerLevel.TRACE:
        return { label: 'TRC', labelColor: 'black.bgBlackBright', messageColor: 'blackBright' };
    }
  }

  /**
   * Returns current machine time in SQL format.
   */
  private getLocalTime(): string {
    const now = new Date();
    const nowOffsetted = new Date(now.getTime() - now.getTimezoneOffset() * 60 * 1000);
    return nowOffsetted.toISOString().slice(0, 19).replace('T', ' ');
  }

}
