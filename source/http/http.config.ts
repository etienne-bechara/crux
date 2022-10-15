import { HttpStatus } from '@nestjs/common';

import { HttpMethod } from './http.enum';
import { HttpOptions } from './http.interface';

// eslint-disable-next-line @typescript-eslint/naming-convention
export const HTTP_DEFAULT_OPTIONS: HttpOptions = {
  retryLimit: 2,
  retryMethods: [
    HttpMethod.GET,
    HttpMethod.PUT,
    HttpMethod.HEAD,
    HttpMethod.DELETE,
    HttpMethod.OPTIONS,
    HttpMethod.TRACE,
  ],
  retryCodes: [
    HttpStatus.REQUEST_TIMEOUT,
    HttpStatus.TOO_MANY_REQUESTS,
    HttpStatus.INTERNAL_SERVER_ERROR,
    HttpStatus.BAD_GATEWAY,
    HttpStatus.SERVICE_UNAVAILABLE,
    HttpStatus.GATEWAY_TIMEOUT,
  ],
  retryDelay: (attempts: number): number => {
    return attempts > 4 ? 16_000 : 2 ** (attempts - 1) * 1000;
  },
};
