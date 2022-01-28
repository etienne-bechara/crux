import { HttpRequestParams } from './http.request.params';

export interface HttpExceptionParams {
  url: string;
  request: HttpRequestParams;
  error: any;
}
