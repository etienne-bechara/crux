import { AxiosResponse } from 'axios';

import { HttpsCookie } from './https.cookie';

export interface HttpsResponse extends AxiosResponse {
  cookies: HttpsCookie[];
}
