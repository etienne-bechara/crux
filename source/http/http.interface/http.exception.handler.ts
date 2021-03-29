import { AxiosResponse } from 'axios';

import { HttpPredefinedHandler } from '../http.enum';
import { HttpRequestParams } from './http.request.params';

export type HttpExceptionHandler = HttpPredefinedHandler | ((params: HttpHandlerParams) => Promise<void>);

export interface HttpHandlerParams {
  errorMessage: string;
  upstreamRequest: HttpRequestParams;
  upstreamResponse: AxiosResponse | any;
}
