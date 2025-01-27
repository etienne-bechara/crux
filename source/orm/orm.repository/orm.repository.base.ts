import { EntityManager, EntityName } from '@mikro-orm/core';
import { QueryBuilder } from '@mikro-orm/mysql';
import { BadRequestException, ConflictException, InternalServerErrorException, NotImplementedException } from '@nestjs/common';
import { setTimeout } from 'timers/promises';

import { ContextStorageKey } from '../../context/context.enum';
import { ContextStorage } from '../../context/context.storage';
import { TraceService } from '../../trace/trace.service';
import { OrmException, OrmSpanPrefix } from '../orm.enum';
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
    return this.runWithinSpan(OrmSpanPrefix.COMMIT, async () => {
      await this.entityManager.persistAndFlush(entities);
    });
  }

  /**
   * Creates a query builder instance .
   */
  public createQueryBuilder(): QueryBuilder<Entity> {
    return this.entityManager['createQueryBuilder'](this.entityName);
  }

  /**
   * Checks if provided data is valid as single or multiple entities.
   * @param data
   */
  protected isValidData(data: unknown): boolean {
    return Array.isArray(data) ? data.length > 0 : !!data;
  }

  /**
   * Returns entity primary keys.
   */
  protected getPrimaryKeys(): string[] {
    return this.entityManager.getMetadata().get(this.entityName as string).primaryKeys;
  }

  /**
   * Returns custom nested primary keys.
   */
  protected getNestedPrimaryKeys(): string[] {
    this.repositoryOptions.nestedPrimaryKeys ??= [ ];
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
      throw new NotImplementedException(OrmException.UNIQUE_KEY_MISSING);
    }

    return validKey;
  }

  /**
   * Executes target operation wrapped into:
   * - Clear entity manager context for write operations
   * - Shared exception handler to standardize errors
   * - A children tracing span.
   * @param spanPrefix
   * @param operation
   * @param retries
   */
  protected async runWithinSpan<T>(spanPrefix: OrmSpanPrefix, operation: () => Promise<T>, retries = 0): Promise<T> {
    const spanName = `Orm | ${spanPrefix} ${this.entityName as string}`;
    const hasContext = !!ContextStorage.getStore();
    const shareableContext = [ OrmSpanPrefix.READ, OrmSpanPrefix.COUNT, OrmSpanPrefix.POPULATE ];
    const cleanContext = !hasContext || !shareableContext.includes(spanPrefix);

    try {
      const traceResult = await TraceService.startManagedSpan(spanName, { }, async () => {
        return cleanContext
          ? await this.runWithinCleanContext(operation)
          : await operation();
      });

      return traceResult;
    }
    catch (e) {
      return this.handleException({
        caller: (retries) => this.runWithinSpan(spanPrefix, operation, retries),
        retries,
        error: e,
      });
    }
  }

  /**
   * Runs the underlying operation under a new async storage context,
   * including an entity manager fork.
   * @param operation
   */
  private runWithinCleanContext<T>(operation: () => Promise<T>): Promise<T> {
    return ContextStorage.run(new Map(), async () => {
      const store = ContextStorage.getStore();
      const entityManager = this.entityManager.fork({ clear: true, useContext: true });

      store.set(ContextStorageKey.ORM_ENTITY_MANAGER, entityManager);
      let result: T;

      try {
        result = await operation();
      }
      finally {
        entityManager.clear();
      }

      return result;
    });
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
    const retryDelay = 500;
    const retryMax = 4;

    const isRetryable = retryableExceptions.some((r) => message.includes(r));

    if (isRetryable && retries < retryMax) {
      await setTimeout(retryDelay);
      return caller(retries + 1);
    }

    const constraint = message.split(' - ')[message.split(' - ').length - 1];
    const isDeadlockError = /deadlock found/i.test(message);
    const isDuplicateError = /duplicate (entry|key)/i.test(message);
    const isInsertFkError = /add.+foreign key constraint fails|insert.+violates foreign key/i.test(message);
    const isDeleteFkError = /delete.+foreign key constraint fails|delete.+violates foreign key/i.test(message);
    const isInvalidFieldError = message.startsWith('Trying to query by not existing property');
    const isInvalidConditionError = message.startsWith('Invalid query condition');

    this.entityManager.clear();

    if (message === OrmException.ENTITY_NOT_FOUND) {
      throw error;
    }

    if (isDeadlockError) {
      throw new InternalServerErrorException({
        message: OrmException.DEADLOCK,
        constraint,
      });
    }
    else if (isDuplicateError) {
      throw new ConflictException({
        message: OrmException.ENTITY_CONFLICT,
        constraint,
      });
    }
    else if (isInsertFkError) {
      throw new ConflictException({
        message: OrmException.FOREIGN_KEY_NOT_FOUND,
        constraint,
      });
    }
    else if (isDeleteFkError) {
      throw new ConflictException({
        message: OrmException.FOREIGN_KEY_FAIL,
        constraint,
      });
    }
    else if (isInvalidFieldError || isInvalidConditionError) {
      throw new BadRequestException(constraint?.toLowerCase());
    }

    throw new InternalServerErrorException(error);
  }

}
