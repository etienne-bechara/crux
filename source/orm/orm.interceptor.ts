import { MikroORM } from '@mikro-orm/core';
import { CallHandler, ExecutionContext, Injectable, NestInterceptor } from '@nestjs/common';
import { mergeMap } from 'rxjs';

import { ContextStorageKey } from '../context/context.enum';
import { ContextService } from '../context/context.service';

@Injectable()
export class OrmInterceptor implements NestInterceptor {

  public constructor(
    private readonly mikroOrm: MikroORM,
    private readonly contextService: ContextService,
  ) { }

  /**
   * Before a new request arrives at controller, creates a fresh entity
   * manager for manipulation.
   *
   * After processing, if returning data contain entity classes, call
   * their stringify method as well as remove reference recursion.
   * @param context
   * @param next
   */
  public intercept(context: ExecutionContext, next: CallHandler): any {
    const store = this.contextService.getStore();
    const entityManager = this.mikroOrm.em.fork({ clear: true, useContext: true });
    store.set(ContextStorageKey.ORM_ENTITY_MANAGER, entityManager);

    return next
      .handle()
      .pipe(
        // eslint-disable-next-line @typescript-eslint/require-await
        mergeMap(async (data) => {
          return this.stringifyEntities(data);
        }),
      );
  }

  /**
   * Given any data object, check for entities and execute their
   * stringify method.
   * @param data
   */
  private stringifyEntities(data: any): any {
    if (!data) return;

    // Array of entities
    if (Array.isArray(data)) {
      data = data.map((d) => d?.toJSON ? d.toJSON() : d);

      for (const dataItem of data) {
        const dataId = dataItem['id'] as string | number;
        this.eliminateRecursion(dataId, dataItem);
      }

    // Paginated entity
    }
    else if (data.records && Array.isArray(data.records)) {
      data.records = data.records.map((d) => d?.toJSON ? d.toJSON() : d);

      for (const dataItem of data.records) {
        const dataId = dataItem['id'] as string | number;
        this.eliminateRecursion(dataId, dataItem);
      }

    // Single entity
    }
    else if (data.toJSON) {
      data = data.toJSON();
      const dataId = data['id'] as string | number;
      this.eliminateRecursion(dataId, data);
    }

    return data;
  }

  /**
   * Given an object, eliminate properties that references its parent id.
   * @param parentId
   * @param data
   */
  private eliminateRecursion(parentId: string | number, data: any): void {
    if (!data || !parentId || typeof data !== 'object') return;

    if (Array.isArray(data)) {
      for (const dataItem of data) {
        this.eliminateRecursion(parentId, dataItem);
      }

      return;
    }

    for (const key in data) {
      if (key === 'id') continue;

      if (data[key] === parentId || data[key]?.id === parentId) {
        delete data[key];
      }
      else if (typeof data[key] === 'object') {
        this.eliminateRecursion(parentId, data[key]);
      }
    }
  }

}
