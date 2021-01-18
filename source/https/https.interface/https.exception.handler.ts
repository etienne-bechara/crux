import { AxiosResponse } from 'axios';

import { HttpsPredefinedHandler } from '../https.enum';
import { HttpsRequestParams } from './https.request.params';

export type HttpsExceptionHandler = HttpsPredefinedHandler | ((params: HttpsHandlerParams) => Promise<void>);

export interface HttpsHandlerParams {
  errorMessage: string;
  upstreamRequest: HttpsRequestParams;
  upstreamResponse: AxiosResponse | any;
}
