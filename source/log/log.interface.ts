import { LogSeverity } from './log.enum';

export type LogArguments = string | Error | Record<string, any>;

export interface LogOptions {
  /** Sensitive keys to be removed during logging of objects. */
  sensitiveKeys: string[];
  /** Determines whether arrays should be processed when looking for sensitive keys. */
  sensitiveArrays?: boolean;
  /** Enables logging request bodies. */
  enableRequestBody?: boolean;
  /** Enables logging response bodies. */
  enableResponseBody?: boolean;
}

export interface LogParams {
  timestamp: string;
  severity: LogSeverity;
  message: string;
  caller: string;
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
