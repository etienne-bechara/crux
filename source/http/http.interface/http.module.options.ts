import { ModuleMetadata } from '@nestjs/common';
import { IAxiosCacheAdapterOptions } from 'axios-cache-adapter';
import https from 'https';

import { HttpReturnType } from '../http.enum';
import { HttpExceptionHandler } from './http.exception.handler';

export interface HttpAsyncModuleOptions extends Pick<ModuleMetadata, 'imports'> {
  inject?: any[];
  useFactory?: (...args: any[]) => Promise<HttpModuleOptions> | HttpModuleOptions;
}

export interface HttpModuleOptions {
  name?: string;
  manual?: boolean;
  agent?: HttpServiceAgent;
  bases?: HttpServiceBases;
  cache?: IAxiosCacheAdapterOptions | boolean;
  defaults?: HttpServiceDefaults;
}

export interface HttpServiceBases {
  url?: string | (() => string);
  headers?: Record<string, string>;
  query?: Record<string, any>;
  body?: Record<string, any>;
}

export interface HttpServiceDefaults {
  returnType?: HttpReturnType;
  timeout?: number;
  validator?: (status: number) => boolean;
  exceptionHandler?: HttpExceptionHandler;
}

export interface HttpServiceAgent {
  custom?: https.Agent;
  ignoreHttpErrors?: boolean;
  ssl?: {
    cert: string;
    key: string;
    passphrase?: string;
  };
}
