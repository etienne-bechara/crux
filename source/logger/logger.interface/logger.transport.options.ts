import { IsIn, IsOptional } from 'class-validator';

import { AppEnvironment } from '../../app/app.enum';
import { LoggerLevel } from '../logger.enum';

export class LoggerTransportOptions {

  @IsIn(Object.values(AppEnvironment))
  public environment: AppEnvironment;

  @IsOptional()
  @IsIn(Object.values(LoggerLevel))
  public level: LoggerLevel;

}
