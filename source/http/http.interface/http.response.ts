import { Response } from 'got';

import { HttpCookie } from './http.cookie';

export interface HttpResponse<T> extends Response<T> {
  cookies: HttpCookie[];
}
