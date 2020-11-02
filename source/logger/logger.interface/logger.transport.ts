
import { LoggerParams } from '.';
import { LoggerTransportOptions } from './logger.transport.options';

export interface LoggerTransport {
  getOptions: () => LoggerTransportOptions;
  log: (params: LoggerParams) => void;
}

