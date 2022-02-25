import { AppEnvironment } from '../app/app.enum';
import { LoggerLevel } from './logger.enum';

export type LoggerArguments = string | Error | Record<string, any>;

export interface LoggerParams {
  environment: AppEnvironment;
  timestamp: string;
  level: LoggerLevel;
  requestId: string;
  filename: string;
  message: string;
  data: Record<string, any>;
  error: Error;
}

export interface LoggerTransport {
  getLevel: () => LoggerLevel;
  log: (params: LoggerParams) => void;
}
