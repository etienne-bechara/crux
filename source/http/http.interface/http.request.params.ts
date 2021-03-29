import { AxiosRequestConfig, Method } from 'axios';

import { HttpReturnType } from '../http.enum';
import { HttpExceptionHandler } from './http.exception.handler';

export interface HttpRequestParams {
  method?: Method;
  url?: string;

  replacements?: Record<string, string>;
  headers?: Record<string, string>;
  query?: Record<string, any>;
  body?: any;

  form?: Record<string, any>;
  json?: Record<string, any>;

  exceptionHandler?: HttpExceptionHandler;
  returnType?: HttpReturnType;
  timeout?: number;
  validateStatus?: (status: number) => boolean;

  extras?: AxiosRequestConfig;
}
