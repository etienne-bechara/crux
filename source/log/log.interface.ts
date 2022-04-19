import { LogSeverity } from './log.enum';

export type LogArguments = string | Error | Record<string, any>;

export interface LogOptions {
  /** Sensitive keys to be removed during logging of objects. */
  sensitiveKeys?: string[];
  /** Disables logging inbound request bodies. */
  filterRequestBody?: boolean;
  /** Disables logging inbound response bodies. */
  filterResponseBody?: boolean;
}

export interface LogParams {
  timestamp: string;
  severity: LogSeverity;
  caller: string;
  message: string;
  requestId: string;
  traceId: string;
  spanId: string;
  data: Record<string, any>;
  error: Error;
}

export interface LogTransport {
  getName: () => string;
  getSeverity: () => LogSeverity;
  log: (params: LogParams) => void;
}
