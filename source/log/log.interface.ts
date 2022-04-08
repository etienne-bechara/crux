import { LogSeverity } from './log.enum';

export type LogArguments = string | Error | Record<string, any>;

export interface LogParams {
  timestamp: string;
  severity: LogSeverity;
  traceId: string;
  requestId: string;
  caller: string;
  message: string;
  data: Record<string, any>;
  error: Error;
}

export interface LogTransport {
  getName: () => string;
  getSeverity: () => LogSeverity;
  log: (params: LogParams) => void;
}
