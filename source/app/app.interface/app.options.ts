import { HttpStatus, INestApplication, ModuleMetadata } from '@nestjs/common';
import { CorsOptions } from '@nestjs/common/interfaces/external/cors-options.interface';

export interface AppOptions extends ModuleMetadata {
  instance?: INestApplication;
  envPath?: string;
  disableModuleScan?: boolean;
  disableControllers?: boolean;
  disableFilters?: boolean;
  disableInterceptors?: boolean;
  disablePipes?: boolean;
  disableLogger?: boolean;
  port?: number;
  hostname?: string;
  globalPrefix?: string;
  timeout?: number;
  cors?: CorsOptions;
  httpErrors?: HttpStatus[];
  adapterOptions?: Record<string, any>;
}
