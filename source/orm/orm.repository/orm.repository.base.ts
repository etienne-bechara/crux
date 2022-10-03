import { EntityManager, EntityName } from '@mikro-orm/core';
import { QueryBuilder as MySqlQueryBuilder } from '@mikro-orm/mysql';
import { QueryBuilder as PostgreSqlQueryBuilder } from '@mikro-orm/postgresql';
import { BadRequestException, ConflictException, InternalServerErrorException, NotImplementedException } from '@nestjs/common';
import { setTimeout } from 'timers/promises';

import { ContextStorageKey } from '../../context/context.enum';
import { ContextStorage } from '../../context/context.storage';
import { TraceService } from '../../trace/trace.service';
import { OrmExceptionHandlerParams, OrmRepositoryOptions } from '../orm.interface';

export abstract class OrmBaseRepository<Entity extends object> {

  public constructor(
    protected readonly entityManager: EntityManager,
    protected readonly entityName: EntityName<Entity>,
    protected readonly repositoryOptions: OrmRepositoryOptions<Entity>,
  ) { }

  /**
   * Persist changes to provided entities.
   * @param entities
   */
  public commit(entities?: Entity | Entity[]): Promise<void> {
    return this.runWithinSpan('Commit', async () => {
      await this.entityManager.persistAndFlush(entities);
    });
  }

  /**
   * Creates a query builder instance .
   */
  public createQueryBuilder(): MySqlQueryBuilder<Entity> | PostgreSqlQueryBuilder<Entity> {
    return this.entityManager['createQueryBuilder'](this.entityName);
  }

  /**
   * Checks if provided data is valid as single or multiple entities.
   * @param data
   */
  protected isValidData(data: unknown | unknown[]): boolean {
    return Array.isArray(data) ? data.length > 0 : !!data;
  }

  /**
   * Returns custom primary key or 'id'.
   */
  protected getPrimaryKey(): string {
    return this.repositoryOptions.primaryKey || 'id';
  }

  /**
   * Returns custom nested primary keys including id.
   */
  protected getNestedPrimaryKeys(): string[] {
    this.repositoryOptions.nestedPrimaryKeys ??= [];
    return [ 'id', ...this.repositoryOptions.nestedPrimaryKeys ];
  }

  /**
   * Returns provided unique key or default (whichever is valid).
   * @param uniqueKey
   */
  protected getValidUniqueKey(uniqueKey?: (keyof Entity)[]): (keyof Entity)[] {
    const defaultKey = this.repositoryOptions.defaultUniqueKey;
    let validKey: (keyof Entity)[];

    if (uniqueKey && Array.isArray(uniqueKey) && uniqueKey.length > 0) {
      validKey = uniqueKey;
    }

    if (!validKey && Array.isArray(defaultKey) && defaultKey.length > 0) {
      validKey = defaultKey;
    }

    if (!validKey) {
      throw new NotImplementedException('missing default unique key implementation');
    }

    return validKey;
  }

  /**
   * Executes target operation wrapped into:
   * - Shared exception handler to standardize erros as HTTP codes
   * - A children tracing span
   * - Clear entity manager context.
   * @param spanSuffix
   * @param operation
   * @param retries
   */
  protected async runWithinSpan<T>(spanSuffix: string, operation: () => Promise<T>, retries = 0): Promise<T> {
    const spanName = `Orm | ${spanSuffix} ${this.entityName}`;
    const hasContext = !!ContextStorage.getStore();
    const shareableContext = [ 'count', 'populate', 'read' ];
    const cleanContext = !hasContext || !shareableContext.includes(spanSuffix);

    try {
      const traceResult = await TraceService.startManagedSpan(spanName, { }, async () => {
        return cleanContext
          ? await ContextStorage.run(new Map(), () => {
            const store = ContextStorage.getStore();
            const entityManager = this.entityManager.fork({ clear: true, useContext: true });
            store.set(ContextStorageKey.ORM_ENTITY_MANAGER, entityManager);
            return operation();
          })
          : await operation();
      });

      return traceResult;
    }
    catch (e) {
      return this.handleException({
        caller: (retries) => this.runWithinSpan(spanSuffix, operation, retries),
        retries,
        error: e,
      });
    }
  }

  /**
   * Handle all query exceptions, check if retry is possible by comparing
   * known exceptions to the error.
   *
   * If not retryable, check against a set of exceptions that should be
   * throw with their matching http status.
   *
   * Finally, if no match, throw as internal error.
   * @param params
   */
  private async handleException(params: OrmExceptionHandlerParams): Promise<any> {
    const { caller, error, retries } = params;
    const { message } = error;

    const retryableExceptions = [ 'read ECONNRESET' ];
    const isRetryable = retryableExceptions.some((r) => message.includes(r));

    if (isRetryable && retries < 10) {
      await setTimeout(500);
      return caller(retries + 1);
    }

    const constraint = message.split(' - ')[message.split(' - ').length - 1];
    const isDuplicateError = /duplicate (entry|key)/i.test(message);
    const isInsertFkError = /add.+foreign key constraint fails|insert.+violates foreign key/i.test(message);
    const isDeleteFkError = /delete.+foreign key constraint fails|delete.+violates foreign key/i.test(message);
    const isInvalidFieldError = message.startsWith('Trying to query by not existing property');
    const isInvalidConditionError = message.startsWith('Invalid query condition');

    if (isDuplicateError) {
      throw new ConflictException({
        message: 'entity already exists',
        constraint,
      });
    }
    else if (isInsertFkError) {
      throw new ConflictException({
        message: 'foreign key must reference an existing entity',
        constraint,
      });
    }
    else if (isDeleteFkError) {
      throw new ConflictException({
        message: 'foreign key prevents cascade deletion',
        constraint,
      });
    }
    else if (isInvalidFieldError || isInvalidConditionError) {
      throw new BadRequestException(constraint?.toLowerCase());
    }

    throw new InternalServerErrorException(error);
  }

}
