import http from 'http';

import { AppRequest } from './app.request';

export interface AppResponse {
  code: (code: number) => void;
  status: (code: number) => void;
  statusCode: number;
  server: any;
  header: (name: string, value: string) => void;
  headers: (headers: Record<string, string>) => void;
  getHeader: (name: string) => any;
  getHeaders: () => Record<string, any>;
  removeHeader: (name: string) => void;
  hasHeader: (name: string) => boolean;
  type: (value: string) => void;
  redirect: (code: number, dest: string) => void;
  callNotFound: () => void;
  serialize: (payload: any) => string;
  serializer: any;
  send: (payload: any) => void;
  sent: boolean;
  raw: http.ServerResponse;
  log: any;
  request: AppRequest;
  context: any;
}
