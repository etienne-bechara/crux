import { AxiosResponse } from 'axios';

import { HttpCookie } from './http.cookie';

export interface HttpResponse extends AxiosResponse {
  cookies: HttpCookie[];
}
