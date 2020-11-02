import { Injectable } from '@nestjs/common';

import { AppEnvironment } from '../../../app/app.enum';
import { LoggerConfig } from '../../logger.config';
import { LoggerLevel } from '../../logger.enum';
import { LoggerTransportOptions } from '../../logger.interface';

@Injectable()
export class ConsoleConfig extends LoggerConfig {

  public readonly CONSOLE_TRANSPORT_OPTIONS: LoggerTransportOptions[] = [
    { environment: AppEnvironment.LOCAL, level: LoggerLevel.DEBUG },
    { environment: AppEnvironment.DEVELOPMENT, level: LoggerLevel.NOTICE },
    { environment: AppEnvironment.STAGING, level: LoggerLevel.WARNING },
    { environment: AppEnvironment.PRODUCTION, level: LoggerLevel.WARNING },
  ];

}
