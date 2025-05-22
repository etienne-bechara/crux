import { LogOptions } from './log.interface';

export const LOG_DEFAULT_OPTIONS: LogOptions = {
  sensitiveKeys: ['apikey', 'authorization', 'clientkey', 'clientsecret', 'pass', 'password'],
};
