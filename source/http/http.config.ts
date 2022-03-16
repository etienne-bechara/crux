import { HttpStatus } from '@nestjs/common';

import { Config } from '../config/config.decorator';
import { HttpMethod } from './http.enum';

@Config()
export class HttpConfig {

  public readonly HTTP_DEFAULT_RETRY_LIMIT = 2;

  public readonly HTTP_DEFAULT_RETRY_METHODS: HttpMethod[] = [
    HttpMethod.GET,
    HttpMethod.PUT,
    HttpMethod.HEAD,
    HttpMethod.DELETE,
    HttpMethod.OPTIONS,
    HttpMethod.TRACE,
  ];

  public readonly HTTP_DEFAULT_RETRY_CODES: HttpStatus[] = [
    HttpStatus.REQUEST_TIMEOUT,
    HttpStatus.TOO_MANY_REQUESTS,
    HttpStatus.INTERNAL_SERVER_ERROR,
    HttpStatus.BAD_GATEWAY,
    HttpStatus.SERVICE_UNAVAILABLE,
    HttpStatus.GATEWAY_TIMEOUT,
  ];

  // eslint-disable-next-line @typescript-eslint/naming-convention
  public readonly HTTP_DEFAULT_RETRY_DELAY = (attempts: number): number => {
    return attempts > 4 ? 16_000 : 2 ** (attempts - 1) * 1000;
  };

}
