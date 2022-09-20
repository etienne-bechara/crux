import { MikroORM } from '@mikro-orm/core';
import { Inject, Injectable } from '@nestjs/common';

import { LogService } from '../log/log.service';
import { SchemaInjectionToken, SchemaSyncStatus } from './schema.enum';
import { SchemaModuleOptions, SchemaSyncResult } from './schema.interface';

@Injectable()
export class SchemaService {

  public constructor(
    @Inject(SchemaInjectionToken.MODULE_OPTIONS)
    private readonly syncModuleOptions: SchemaModuleOptions = { },
    private readonly mikroOrm: MikroORM,
    private readonly logService: LogService,
  ) {
    const options = this.syncModuleOptions;

    if (options.auto) {
      void this.syncSchema(options);
    }
  }

  /**
   * Remove from schema queries that has been blacklisted.
   * @param queries
   * @param options
   */
  private removeBlacklistedQueries(queries: string, options: SchemaModuleOptions): string {
    options.blacklist ??= [ ];
    queries = queries.replace(/\n+/g, '\n');
    return queries.split('\n').filter((q) => !options.blacklist.includes(q)).join('\n');
  }

  /**
   * Automatically sync current database schema with
   * configured entities.
   * @param options
   */
  public async syncSchema(options: SchemaModuleOptions = { }): Promise<SchemaSyncResult> {
    const { safe } = options;
    this.logService.info('Starting database schema sync...');

    const generator = this.mikroOrm.getSchemaGenerator();
    let syncDump = await generator.getUpdateSchemaSQL({ wrap: false, safe });
    syncDump = this.removeBlacklistedQueries(syncDump, options);

    if (syncDump.length === 0) {
      this.logService.notice('Database schema is up to date');
      return { status: SchemaSyncStatus.UP_TO_DATE };
    }

    let status = SchemaSyncStatus.MIGRATION_SUCCESSFUL;
    let syncQueries = await generator.getUpdateSchemaSQL({ wrap: true, safe });
    syncQueries = this.removeBlacklistedQueries(syncQueries, options);

    try {
      await generator.execute(syncQueries);
      this.logService.notice('Database schema successfully updated');
    }
    catch (e) {
      status = SchemaSyncStatus.MIGRATION_FAILED;
      this.logService.error('Database schema update failed', e as Error, { syncQueries });
    }

    return {
      status,
      queries: syncQueries.split('\n'),
    };
  }

  /**
   * Erase current database schema and recreate it.
   */
  public async resetSchema(): Promise<void> {
    this.logService.info('Starting database schema reset...');

    const generator = this.mikroOrm.getSchemaGenerator();
    await generator.dropSchema();
    await generator.createSchema();

    this.logService.notice('Database schema successfully reset');
  }

}
