import { LoggerLevel } from '../logger.enum';

export interface LoggerParams {
  level: LoggerLevel;
  message: string;
  error: Error;
  data?: Record<string, any>;
}
