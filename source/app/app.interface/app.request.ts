import http from 'http';

/**
 * Equivalent to request wrapper created by Fastify
 * after going through the middlewares.
 */
export interface AppRequest {
  query: any;
  body: any;
  params: any;
  headers: any;
  raw: AppRawRequest;
  server: any;
  id: string;
  log: any;
  ip: string;
  ips: string[];
  hostname: string;
  protocol: 'http' | 'https';
  method: string;
  url: string;
  routerMethod: string;
  routerPath: string;
  is404: boolean;
  socket: any;
  context: any;
}

/**
 * Equivalent to http request before applying middlewares.
 */
export interface AppRawRequest extends http.IncomingMessage {
  metadata: any;
}
