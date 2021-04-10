import { LoggerLevel } from '../logger.enum';
import { LoggerParams } from './logger.params';

export interface LoggerTransport {
  getLevel: () => LoggerLevel;
  log: (params: LoggerParams) => void;
}
