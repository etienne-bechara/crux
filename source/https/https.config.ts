import { Injectable } from '@nestjs/common';

@Injectable()
export class HttpsConfig {

  public readonly HTTPS_DEFAULT_TIMEOUT = 60 * 1000;

  public static readonly HTTPS_MODULE_ID_TOKEN = 'HTTPS_MODULE_ID_TOKEN';

  public static readonly HTTPS_MODULE_OPTIONS_TOKEN = 'HTTPS_MODULE_OPTIONS_TOKEN';

}
