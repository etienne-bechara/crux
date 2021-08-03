import { HttpStatus, INestApplication, ModuleMetadata } from '@nestjs/common';
import { CorsOptions } from '@nestjs/common/interfaces/external/cors-options.interface';

export interface AppBootOptions extends ModuleMetadata {
  envPath?: string;
  disableModuleScan?: boolean;
  disableConfigScan?: boolean;
  disableFilters?: boolean;
  disableInterceptors?: boolean;
  disablePipes?: boolean;
  configs?: any[];
  modules?: any[];
  port?: number;
  hostname?: string;
  cors?: CorsOptions;
  timeout?: number;
  httpErrors?: HttpStatus[];
  adapterOptions?: Record<string, any>;
  beforeListen?: (app: INestApplication) => void | Promise<void>;
}
