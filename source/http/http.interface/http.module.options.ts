import { ModuleMetadata } from '@nestjs/common';
import { ExtendOptions } from 'got';

export interface HttpAsyncModuleOptions extends Pick<ModuleMetadata, 'imports'> {
  inject?: any[];
  useFactory?: (...args: any[]) => Promise<HttpModuleOptions> | HttpModuleOptions;
}

export interface HttpModuleOptions extends ExtendOptions {
  /** Display name for logging. */
  name?: string;
  /** Disable logging of operations. */
  silent?: boolean;
  /** In case of an exception, will return to client the exact same code and body from upstream. */
  proxyException?: boolean;
}
