import { ModuleMetadata } from '@nestjs/common';

import { SchemaSyncStatus } from './schema.enum';

export interface SchemaSyncResult {
  status: SchemaSyncStatus;
  queries?: string[];
}

export interface SchemaAsyncModuleOptions extends Pick<ModuleMetadata, 'imports'> {
  inject?: any[];
  useFactory: (...args: any[]) => Promise<SchemaModuleOptions> | SchemaModuleOptions;
}

export interface SchemaModuleOptions {
  /**
   * Automatically syncs database schema on application initialization.
   */
  auto?: boolean;
  /**
   * Remove destructive statements when syncing schema.
   */
  safe?: boolean;
  /**
   * List of queries that should be ignored when syncing schema.
   */
  blacklist?: string[];
}
