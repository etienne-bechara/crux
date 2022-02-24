import { HttpException, HttpStatus, INestApplication, ModuleMetadata } from '@nestjs/common';
import { CorsOptions } from '@nestjs/common/interfaces/external/cors-options.interface';
import http from 'http';
import os from 'os';

export interface AppOptions extends ModuleMetadata {
  instance?: INestApplication;
  envPath?: string;
  disableScan?: boolean;
  disableStatus?: boolean;
  disableFilter?: boolean;
  disableSerializer?: boolean;
  disableValidator?: boolean;
  disableLogger?: boolean;
  disableMetrics?: boolean;
  port?: number;
  hostname?: string;
  globalPrefix?: string;
  timeout?: number;
  cors?: CorsOptions;
  httpErrors?: HttpStatus[];
  adapterOptions?: Record<string, any>;
  sensitiveKeys?: string[];
}

export interface AppStatus {
  system: {
    version: string;
    type: string;
    release: string;
    architecture: string;
    endianness: string;
    uptime: number;
  };
  cpus: os.CpuInfo[];
  memory: {
    total: number;
    free: number;
  };
  network: AppNetwork;
}

export interface AppNetwork {
  publicIp: string;
  interfaces: NodeJS.Dict<os.NetworkInterfaceInfo[]>;
}

/**
 * Equivalent to request wrapper created by Fastify
 * after going through the middlewares.
 */
export interface AppRequest {
  time: number;
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

export interface AppException {
  exception: HttpException | Error;
  statusCode: HttpStatus;
  message: string;
  details: AppExceptionDetails;
}

export interface AppExceptionDetails extends Record<string, any> {
  proxyExceptions?: boolean;
  outboundResponse?: Record<string, any>;
  outboundRequest?: Record<string, any>;
  constraints?: string[];
}

export interface AppExceptionResponse extends Record<string, any> {
  code: number;
  message: string;
}
