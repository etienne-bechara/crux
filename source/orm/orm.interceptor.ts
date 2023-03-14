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
   * their serialization method.
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

    if (Array.isArray(data)) {
      data = data.map((d) => d?.toJSON ? d.toJSON() : d);
    }
    else if (data.records && Array.isArray(data.records)) {
      data.records = data.records.map((d) => d?.toJSON ? d.toJSON() : d);
    }
    else if (data.toJSON) {
      data = data.toJSON();
    }

    return data;
  }

}
