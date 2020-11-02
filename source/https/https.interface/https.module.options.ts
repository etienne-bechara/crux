import { ModuleMetadata } from '@nestjs/common';
import { AxiosResponse } from 'axios';
import https from 'https';

import { HttpsReturnType } from '../https.enum';
import { HttpsRequestParams } from './https.request.params';

export interface HttpsAsyncModuleOptions extends Pick<ModuleMetadata, 'imports'> {
  inject?: any[];
  useFactory?: (...args: any[]) => Promise<HttpsModuleOptions> | HttpsModuleOptions;
}

export interface HttpsModuleOptions {
  agent?: HttpsServiceAgent;
  bases?: HttpsServiceBases;
  defaults?: HttpsServiceDefaults;
}

export interface HttpsServiceBases {
  url?: string;
  query?: Record<string, string>;
  body?: Record<string, unknown>;
  headers?: Record<string, string>;
}

export interface HttpsServiceDefaults {
  returnType?: HttpsReturnType;
  timeout?: number;
  validator?: (status: number) => boolean;
  exceptionHandler?: (
    requestParams: HttpsRequestParams,
    upstreamResponse: AxiosResponse | any,
    errorMessage: string
  ) => Promise<void>;
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
