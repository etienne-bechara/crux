import { AnyEntity, CountOptions, DeleteOptions, EntityData, EntityManager, EntityName, EntityRepository, FilterQuery, FindOneOptions, FindOneOrFailOptions, FindOptions, Loaded, Primary, RequiredEntityData, UpdateOptions } from '@mikro-orm/core';
import { QueryBuilder as MySqlQueryBuilder } from '@mikro-orm/mysql';
import { QueryBuilder as PostgreSqlQueryBuilder } from '@mikro-orm/postgresql';
import { BadRequestException, ConflictException, InternalServerErrorException, NotImplementedException } from '@nestjs/common';

import { ContextStorage } from '../../context/context.storage';
import { TraceService } from '../../trace/trace.service';
import { OrmStoreKey } from '../orm.enum';
import { OrmExceptionHandlerParams, OrmRepositoryOptions, OrmRunWithinContextParams } from '../orm.interface';

export abstract class OrmBaseRepository<Entity> extends EntityRepository<Entity> {

  public constructor(
    protected readonly entityManager: EntityManager,
    protected readonly entityName: EntityName<Entity>,
    protected readonly repositoryOptions: OrmRepositoryOptions<Entity>,
  ) {
    super(entityManager, entityName);
  }

  /**
   * Acquires current request storage.
   */
  private getStore(): Map<string, any> {
    return ContextStorage.getStore();
  }

  /**
   * Sets pending commit flag.
   */
  private setCommitPending(): void {
    this.getStore()?.set(OrmStoreKey.COMMIT_PENDING, true);
  }

  /**
   * Clears pending commit flag.
   */
  private clearCommitPending(): void {
    this.getStore()?.set(OrmStoreKey.COMMIT_PENDING, false);
  }

  /**
   * Execute all pending entity changes.
   * @param retries
   */
  private async sync(retries: number = 0): Promise<void> {
    this.clearCommitPending();

    try {
      await this.entityManager.flush();
      this.entityManager.clear();
    }
    catch (e) {
      return OrmBaseRepository.handleException({
        caller: (retries) => this.sync(retries),
        retries,
        error: e,
      });
    }
  }

  /**
   * Executes target operation wrapped into a tracing span.
   * In the event of an exception, register span as failed and rethrow.
   * @param spanSuffix
   * @param operation
   */
  protected runWithinSpan<T>(spanSuffix: string, operation: () => Promise<T>): Promise<T> {
    return this.runWithinSpanHandler({
      name: `${this.entityName}Repository.${spanSuffix}()`,
      operation,
    });
  }

  /**
   * Executes target operation wrapped into a tracing span, as wll as
   * clear entity manager.
   * In the event of an exception, register span as failed and rethrow.
   * @param spanSuffix
   * @param operation
   */
  protected runWithinClearContextSpan<T>(spanSuffix: string, operation: () => Promise<T>): Promise<T> {
    return this.runWithinSpanHandler({
      name: `${this.entityName}Repository.${spanSuffix}()`,
      clear: true,
      operation,
    });
  }

  /**
   * Executes target operation wrapped into a tracing span, allow to
   * optionally run in a clear context as well.
   * In the event of an exception, register span as failed and rethrow.
   * @param params
   */
  private runWithinSpanHandler<T>(params: OrmRunWithinContextParams<T>): Promise<T> {
    const { name, clear, operation } = params;

    return TraceService.startActiveSpan(name, { }, async (span) => {
      try {
        const result = !clear
          ? await operation()
          : await ContextStorage.run(new Map(), () => {
            const store = ContextStorage.getStore();
            const entityManager = this.entityManager.fork({ clear: true, useContext: true });
            store.set(OrmStoreKey.ENTITY_MANAGER, entityManager);
            return operation();
          });

        span.setStatus({ code: 1 });
        return result;
      }
      catch (e) {
        span.recordException(e as Error);
        span.setStatus({ code: 2, message: e.message });
        throw e;
      }
      finally {
        span.end();
      }
    });
  }

  /**
   * Validates if provided data is valid as single or multiple entities.
   * @param entities
   */
  protected isValidEntity(entities: Entity | Entity[]): boolean {
    return Array.isArray(entities) ? entities.length > 0 : !!entities;
  }

  /**
   * Mark entities changes to be removed on the next commit call.
   * @param entities
   */
  protected removeAsync(entities: Entity | Entity[]): void {
    if (!this.isValidEntity(entities)) return;
    this.entityManager.remove(entities);
    this.setCommitPending();
  }

  /**
   * Mark entities changes to be persisted on the next commit call.
   * @param entities
   */
  public commitAsync(entities: Entity | Entity[]): void {
    if (!this.isValidEntity(entities)) return;
    this.entityManager.persist(entities);
    this.setCommitPending();
  }

  /**
   * Persist all entities changes, if any entity is provided
   * mark it for persistance prior to committing.
   * @param entities
   */
  public async commit(entities?: Entity | Entity[]): Promise<void> {
    if (entities) {
      this.commitAsync(entities);
    }

    await this.sync();
  }

  /**
   * Clear all pending operations on entity manager.
   */
  public rollback(): void {
    this.entityManager.clear();
  }

  /**
   * Creates a query builder instance .
   */
  public createQueryBuilder<Entity extends object>(): MySqlQueryBuilder<Entity> | PostgreSqlQueryBuilder<Entity> {
    return this.entityManager['createQueryBuilder'](this.entityName);
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
   * Handle all query exceptions, check if retry is possible by comparing
   * known exceptions to the error.
   *
   * If not retryable, check against a set of exceptions that should be
   * throw with their matching http status.
   *
   * Finally, if no match, throw as internal error.
   * @param params
   */
  public static async handleException(params: OrmExceptionHandlerParams): Promise<any> {
    const { caller, error, retries } = params;
    const { message } = error;

    const retryableExceptions = [ 'read ECONNRESET' ];
    const isRetryable = retryableExceptions.some((r) => message.includes(r));

    if (isRetryable && retries < 10) {
      await new Promise((r) => setTimeout(r, 500));
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

  /**
   * Use `update()`.
   * @param entity
   * @param data
   * @deprecated
   */
  public assign(entity: Entity, data: EntityData<Entity>): Entity {
    return super.assign(entity, data);
  }

  /**
   * Use `countBy()`.
   * @param where
   * @param options
   * @deprecated
   */
  public count(where?: FilterQuery<Entity>, options?: CountOptions<Entity>): Promise<number> {
    return super.count(where, options);
  }

  /**
   * Use `createFrom()`.
   * @param data
   * @deprecated
   */
  public create(data: RequiredEntityData<Entity>): Entity {
    // eslint-disable-next-line @typescript-eslint/no-unsafe-argument
    return super.create(data);
  }

  /**
   * Use `commit()`.
   * @deprecated
   */
  public async flush(): Promise<void> {
    return super.flush();
  }

  /**
   * Use `readBy()`.
   * @param where
   * @param options
   * @deprecated
   */
  public find<P extends string = never>(
    where: FilterQuery<Entity>, options?: FindOptions<Entity, P>,
  ): Promise<Loaded<Entity, P>[]> {
    // eslint-disable-next-line unicorn/no-array-callback-reference, unicorn/no-array-method-this-argument
    return super.find(where, options);
  }

  /**
   * Use `readBy()`.
   * @param options
   * @deprecated
   */
  public findAll<P extends string = never>(options?: FindOptions<Entity, P>): Promise<Loaded<Entity, P>[]> {
    return super.findAll(options);
  }

  /**
   * Use `readOne()`.
   * @param where
   * @param options
   * @deprecated
   */
  public findOne<P extends string = never>(
    where: FilterQuery<Entity>, options?: FindOneOptions<Entity, P>,
  ): Promise<Loaded<Entity, P> | null> {
    return super.findOne(where, options);
  }

  /**
   * Use `readOneOrFail()`.
   * @param where
   * @param options
   * @deprecated
   */
  public findOneOrFail<P extends string = never>(
    where: FilterQuery<Entity>, options?: FindOneOrFailOptions<Entity, P>,
  ): Promise<Loaded<Entity, P>> {
    return super.findOneOrFail(where, options);
  }

  /**
   * Use `readPaginatedBy()`.
   * @param where
   * @param options
   * @deprecated
   */
  public findAndCount<P extends string = never>(
    where: FilterQuery<Entity>, options?: FindOptions<Entity, P>,
  ): Promise<[Loaded<Entity, P>[], number]> {
    return super.findAndCount(where, options);
  }

  /**
   * Use `deleteBy()`.
   * @param where
   * @param options
   * @deprecated
   */
  public nativeDelete(where: FilterQuery<Entity>, options?: DeleteOptions<Entity>): Promise<number> {
    return super.nativeDelete(where, options);
  }

  /**
   * Use `createFrom()`.
   * @param data
   * @deprecated
   */
  public nativeInsert(data: EntityData<Entity>): Promise<Primary<Entity>> {
    return super.nativeInsert(data);
  }

  /**
   * Use `updateBy()`.
   * @param where
   * @param data
   * @param options
   * @deprecated
   */
  public nativeUpdate(
    where: FilterQuery<Entity>, data: EntityData<Entity>, options?: UpdateOptions<Entity>,
  ): Promise<number> {
    return super.nativeUpdate(where, data, options);
  }

  /**
   * Use `commitAsync()`.
   * @param entity
   * @deprecated
   */
  public persist(entity: AnyEntity | AnyEntity[]): EntityManager {
    return super.persist(entity);
  }

  /**
   * Use `commit()`.
   * @param entity
   * @deprecated
   */
  public async persistAndFlush(entity: AnyEntity | AnyEntity[]): Promise<void> {
    return super.persistAndFlush(entity);
  }

  /**
   * Use `deleteAsync()`.
   * @param entity
   * @deprecated
   */
  public remove(entity: AnyEntity | AnyEntity[]): EntityManager {
    return super.remove(entity);
  }

  /**
   * Use `delete()`.
   * @param entity
   * @deprecated
   */
  public async removeAndFlush(entity: AnyEntity | AnyEntity[]): Promise<void> {
    return super.removeAndFlush(entity);
  }

}
