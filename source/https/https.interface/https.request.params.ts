import { AxiosRequestConfig, AxiosResponse } from 'axios';

import { HttpsReturnType } from '../https.enum';

/**
 * Adds extra request options to Axios package.
 */
export interface HttpsRequestParams extends AxiosRequestConfig {

  replacements?: Record<string, unknown>;
  form?: Record<string, unknown>;
  json?: Record<string, unknown>;

  returnType?: HttpsReturnType;

  exceptionHandler?: (
    requestParams: HttpsRequestParams,
    upstreamResponse: AxiosResponse | any,
    errorMessage: string
  ) => Promise<void>;

}
