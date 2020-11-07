/* eslint-disable no-console */
import { Injectable } from '@nestjs/common';

import { AppEnvironment } from '../../../app/app.enum';
import { LoggerLevel } from '../../logger.enum';
import { LoggerParams, LoggerTransport } from '../../logger.interface';
import { LoggerTransportOptions } from '../../logger.interface/logger.transport.options';
import { LoggerService } from '../../logger.service';
import { ConsoleConfig } from './console.config';
import { ConsoleStyle } from './console.interface';

@Injectable()
export class ConsoleService implements LoggerTransport {

  public constructor(
    protected readonly consoleConfig: ConsoleConfig,
    protected readonly loggerService: LoggerService,
  ) {
    this.loggerService.registerTransport(this);
  }

  /**
   * Returns the options object for current
   * application environment.
   */
  public getOptions(): LoggerTransportOptions {
    const environment = this.consoleConfig.NODE_ENV;
    const options = this.consoleConfig.CONSOLE_TRANSPORT_OPTIONS;
    return options.find((o) => o.environment === environment);
  }

  /**
   * Logs a message on the console, if the environment is set
   * to LOCAL applies colorization based on severity.
   * @param params
   */
  public log(params: LoggerParams): void {
    const env = this.consoleConfig.NODE_ENV;
    const style = this.getStyle(params.level);
    const now = this.getLocalTime();
    const chalk = this.getColorizer();

    // Colored
    if (env === AppEnvironment.LOCAL && chalk) {
      const msg = chalk`{grey ${now}} {${style.labelColor}  ${style.label} } {${style.messageColor} ${params.message}}`;
      console.log(msg);

      if (params.error && params.level <= LoggerLevel.ERROR) {
        console.log(chalk`{grey ${params.error.stack}}`);
      }

    // Standard
    }
    else {
      const msg = `${now} ${style.label} ${params.message}`;

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

  /**
   * Returns the colorizing middleware (local only).
   */
  private getColorizer(): any {
    let colorizer;

    try {
      colorizer = require('chalk');
    }
    catch {
      /* undefined */
    }

    return colorizer;
  }

}
