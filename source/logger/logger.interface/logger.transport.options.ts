import { AppEnvironment } from '../../app/app.enum';
import { LoggerLevel } from '../logger.enum';

export interface LoggerTransportOptions {
  environment: AppEnvironment;
  level: LoggerLevel;
}
