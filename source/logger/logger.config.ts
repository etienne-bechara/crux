
import { AppEnvironment } from '../app/app.enum';
import { Config, InjectSecret } from '../config/config.decorator';

@Config()
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
