import { Injectable } from '@nestjs/common';

import { AppEnvironment } from '../app/app.enum';
import { InjectSecret } from '../config/config.decorator';

@Injectable()
export class LoggerConfig {

  @InjectSecret()
  public readonly NODE_ENV: AppEnvironment;

  public readonly LOGGER_SENSITIVE_KEYS = [
    'athash',
    'aud',
    'authorization',
    'clientkey',
    'clientsecret',
    'key',
    'nonce',
    'pass',
    'password',
    'secret',
    'sub',
  ];

}
