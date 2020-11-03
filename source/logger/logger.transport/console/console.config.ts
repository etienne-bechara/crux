import { Injectable } from '@nestjs/common';
import { Type } from 'class-transformer';
import { IsArray, IsObject, ValidateNested } from 'class-validator';

import { AppEnvironment } from '../../../app/app.enum';
import { InjectSecret } from '../../../config/config.decorator';
import { LoggerConfig } from '../../logger.config';
import { LoggerLevel } from '../../logger.enum';
import { LoggerTransportOptions } from '../../logger.interface';

@Injectable()
export class ConsoleConfig extends LoggerConfig {

  @InjectSecret({
    json: true,
    default: [
      { environment: AppEnvironment.LOCAL, level: LoggerLevel.DEBUG },
      { environment: AppEnvironment.DEVELOPMENT, level: LoggerLevel.NOTICE },
      { environment: AppEnvironment.STAGING, level: LoggerLevel.WARNING },
      { environment: AppEnvironment.PRODUCTION, level: LoggerLevel.WARNING },
    ],
  })
  @ValidateNested({ each: true })
  @Type(() => LoggerTransportOptions)
  @IsArray()
  @IsObject({ each: true })
  public readonly CONSOLE_TRANSPORT_OPTIONS: LoggerTransportOptions[];

}
