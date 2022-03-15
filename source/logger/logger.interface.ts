import { AppEnvironment } from '../app/app.enum';
import { LoggerSeverity } from './logger.enum';

export type LoggerArguments = string | Error | Record<string, any>;

export interface LoggerParams {
  environment: AppEnvironment;
  timestamp: string;
  severity: LoggerSeverity;
  requestId: string;
  caller: string;
  message: string;
  data: Record<string, any>;
  error: Error;
}

export interface LoggerTransport {
  getSeverity: () => LoggerSeverity;
  log: (params: LoggerParams) => void;
}
