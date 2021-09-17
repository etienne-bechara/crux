import { HttpStatus, ModuleMetadata } from '@nestjs/common';
import { CorsOptions } from '@nestjs/common/interfaces/external/cors-options.interface';

export interface AppOptions extends ModuleMetadata {
  envPath?: string;
  disableModuleScan?: boolean;
  disableConfigScan?: boolean;
  disableFilters?: boolean;
  disableInterceptors?: boolean;
  disablePipes?: boolean;
  disableLogger?: boolean;
  configs?: any[];
  port?: number;
  hostname?: string;
  globalPrefix?: string;
  timeout?: number;
  cors?: CorsOptions;
  httpErrors?: HttpStatus[];
  adapterOptions?: Record<string, any>;
}
