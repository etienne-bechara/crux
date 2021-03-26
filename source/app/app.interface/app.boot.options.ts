import { ModuleMetadata } from '@nestjs/common';

export interface AppBootOptions extends ModuleMetadata {
  envPath?: string;
  disableModuleScan?: boolean;
  disableConfigScan?: boolean;
  disableFilters?: boolean;
  disableInterceptors?: boolean;
  disablePipes?: boolean;
  configs?: any[];
  modules?: any[];
}
