import http from 'http';

import { AppResponse } from './app.response';

export interface ParsedQs { [key: string]: undefined | string | string[] | ParsedQs | ParsedQs[] }

export interface ParamsDictionary {
  [key: string]: string;
}

export interface AppRequest<
  P = ParamsDictionary,
  ResBody = any,
  ReqBody = any,
  ReqQuery = ParsedQs,
  Locals extends Record<string, any> = Record<string, any>
> extends http.IncomingMessage {
  get(name: 'set-cookie'): string[] | undefined;
  get(name: string): string | undefined;
  header(name: 'set-cookie'): string[] | undefined;
  header(name: string): string | undefined;
  accepts(): string[];
  accepts(type: string): string | false;
  accepts(type: string[]): string | false;
  accepts(...type: string[]): string | false;
  acceptsCharsets(): string[];
  acceptsCharsets(charset: string): string | false;
  acceptsCharsets(charset: string[]): string | false;
  acceptsCharsets(...charset: string[]): string | false;
  acceptsEncodings(): string[];
  acceptsEncodings(encoding: string): string | false;
  acceptsEncodings(encoding: string[]): string | false;
  acceptsEncodings(...encoding: string[]): string | false;
  acceptsLanguages(): string[];
  acceptsLanguages(lang: string): string | false;
  acceptsLanguages(lang: string[]): string | false;
  acceptsLanguages(...lang: string[]): string | false;
  range(size: number, options?: any): any;
  accepted: MediaType[];
  param(name: string, defaultValue?: any): string;
  is(type: string | string[]): string | false | null;
  protocol: string;
  secure: boolean;
  ip: string;
  ips: string[];
  subdomains: string[];
  path: string;
  hostname: string;
  fresh: boolean;
  stale: boolean;
  xhr: boolean;
  body: ReqBody;
  cookies: any;
  method: string;
  params: P;
  query: ReqQuery;
  route: any;
  signedCookies: any;
  originalUrl: string;
  url: string;
  baseUrl: string;
  app: any;
  res?: AppResponse<ResBody, Locals>;
  next?: NextFunction;
  metadata?: AppRequestMetadata;
}

export interface AppRequestMetadata extends Record<string, any> {
  clientIp?: string;
  userAgent?: string;
  jwtPayload?: any;
}

export interface MediaType {
  value: string;
  quality: number;
  type: string;
  subtype: string;
}

export interface NextFunction {
  (err?: any): void;
  (deferToNext: 'router'): void;
  (deferToNext: 'route'): void;
}
