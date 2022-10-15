import { LogOptions } from './log.interface';

// eslint-disable-next-line @typescript-eslint/naming-convention
export const LOG_DEFAULT_OPTIONS: LogOptions = {
  sensitiveKeys: [
    'apikey',
    'authorization',
    'clientkey',
    'clientsecret',
    'pass',
    'password',
  ],
};
