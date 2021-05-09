import { HttpStatus, ModuleMetadata } from '@nestjs/common';
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
  timeout?: number;
  jsonLimit?: string;
  cors?: CorsOptions;
  httpErrors?: HttpStatus[];
}
