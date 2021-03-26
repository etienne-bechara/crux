import { AxiosRequestConfig, Method } from 'axios';

import { HttpsReturnType } from '../https.enum';
import { HttpsExceptionHandler } from './https.exception.handler';

export interface HttpsRequestParams {
  method?: Method;
  url?: string;

  replacements?: Record<string, string>;
  headers?: Record<string, string>;
  query?: Record<string, any>;
  body?: Record<string, any>;

  form?: Record<string, any>;
  json?: Record<string, any>;

  exceptionHandler?: HttpsExceptionHandler;
  returnType?: HttpsReturnType;
  timeout?: number;
  validateStatus?: (status: number) => boolean;

  extras?: AxiosRequestConfig;
}
