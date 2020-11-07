import { AxiosRequestConfig, AxiosResponse } from 'axios';

import { HttpsReturnType } from '../https.enum';

/**
 * Adds extra request options to Axios package.
 */
export interface HttpsRequestParams extends AxiosRequestConfig {
  replacements?: Record<string, string>;
  query?: Record<string, any>;
  form?: Record<string, any>;
  json?: Record<string, any>;

  returnType?: HttpsReturnType;

  exceptionHandler?: (
    requestParams: HttpsRequestParams,
    upstreamResponse: AxiosResponse | any,
    errorMessage: string
  ) => Promise<void>;

}
