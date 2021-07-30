import { HttpRequestParams } from './http.request.params';

export interface HttpExceptionHandlerParams {
  url: string;
  request: HttpRequestParams;
  error: any;
}
