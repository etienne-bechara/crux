import { AxiosRequestConfig } from 'axios';

import { HttpsReturnType } from '../https.enum';
import { HttpsExceptionHandler } from './https.exception.handler';

/**
 * Adds extra request options to Axios package.
 */
export interface HttpsRequestParams extends AxiosRequestConfig {
  replacements?: Record<string, string>;
  query?: Record<string, any>;
  form?: Record<string, any>;
  json?: Record<string, any>;

  returnType?: HttpsReturnType;

  exceptionHandler?: HttpsExceptionHandler;

}
