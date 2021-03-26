import { ModuleMetadata } from '@nestjs/common';
import { IAxiosCacheAdapterOptions } from 'axios-cache-adapter';
import https from 'https';

import { HttpsReturnType } from '../https.enum';
import { HttpsExceptionHandler } from './https.exception.handler';

export interface HttpsAsyncModuleOptions extends Pick<ModuleMetadata, 'imports'> {
  inject?: any[];
  useFactory?: (...args: any[]) => Promise<HttpsModuleOptions> | HttpsModuleOptions;
}

export interface HttpsModuleOptions {
  name?: string;
  agent?: HttpsServiceAgent;
  bases?: HttpsServiceBases;
  cache?: IAxiosCacheAdapterOptions;
  defaults?: HttpsServiceDefaults;
}

export interface HttpsServiceBases {
  url?: string | (() => string);
  headers?: Record<string, string>;
  query?: Record<string, any>;
  body?: Record<string, any>;
}

export interface HttpsServiceDefaults {
  returnType?: HttpsReturnType;
  timeout?: number;
  validator?: (status: number) => boolean;
  exceptionHandler?: HttpsExceptionHandler;
}

export interface HttpsServiceAgent {
  custom?: https.Agent;
  ignoreHttpsErrors?: boolean;
  ssl?: {
    cert: string;
    key: string;
    passphrase?: string;
  };
}
