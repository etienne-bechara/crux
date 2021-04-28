import http from 'http';

export type Send<ResBody = any, T = AppResponse<ResBody>> = (body?: ResBody) => T;
export type Errback = (err: Error) => void;

export interface AppResponse<
  ResBody = any,
  Locals extends Record<string, any> = Record<string, any>,
  StatusCode extends number = number
> extends http.ServerResponse {
  status(code: StatusCode): this;
  sendStatus(code: StatusCode): this;
  links(links: any): this;
  send: Send<ResBody, this>;
  json: Send<ResBody, this>;
  jsonp: Send<ResBody, this>;
  sendFile(path: string, fn?: Errback): void;
  sendFile(path: string, options: any, fn?: Errback): void;
  download(path: string, fn?: Errback): void;
  download(path: string, filename: string, fn?: Errback): void;
  download(path: string, filename: string, options: any, fn?: Errback): void;
  contentType(type: string): this;
  type(type: string): this;
  format(obj: any): this;
  attachment(filename?: string): this;
  set(field: any): this;
  set(field: string, value?: string | string[]): this;
  header(field: any): this;
  header(field: string, value?: string | string[]): this;
  headersSent: boolean;
  get(field: string): string;
  clearCookie(name: string, options?: any): this;
  cookie(name: string, val: string, options: CookieOptions): this;
  cookie(name: string, val: any, options: CookieOptions): this;
  cookie(name: string, val: any): this;
  location(url: string): this;
  redirect(url: string): void;
  redirect(status: number, url: string): void;
  redirect(url: string, status: number): void;
  render(view: string, options?: any, callback?: (err: Error, html: string) => void): void;
  render(view: string, callback?: (err: Error, html: string) => void): void;
  locals: Locals;
  charset: string;
  vary(field: string): this;
  app: any;
  append(field: string, value?: string[] | string): this;
  req?: Request;
}

export interface CookieOptions {
  maxAge?: number;
  signed?: boolean;
  expires?: Date;
  httpOnly?: boolean;
  path?: string;
  domain?: string;
  secure?: boolean;
  encode?: (val: string) => string;
  sameSite?: boolean | 'lax' | 'strict' | 'none';
}
