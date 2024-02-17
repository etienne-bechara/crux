import { CallHandler, ExecutionContext, Injectable, InternalServerErrorException, NestInterceptor } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { ClassConstructor, plainToClass } from 'class-transformer';
import { validate } from 'class-validator';
import { map, Observable } from 'rxjs';

import { AppConfig } from '../app/app.config';
import { AppMetadataKey } from '../app/app.enum';
import { TraceService } from '../trace/trace.service';

@Injectable()
export class ValidateInterceptor implements NestInterceptor {

  public constructor(
    private readonly appConfig: AppConfig,
    private readonly reflector: Reflector,
  ) { }

  /**
   * Add tracing and response body validation support.
   * @param context
   * @param next
   */
  public intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    const options = this.appConfig.APP_OPTIONS.validator?.response || { };

    const responseClass: ClassConstructor<unknown> = this.reflector.get(
      AppMetadataKey.RESPONSE_CLASS,
      context.getHandler(),
    );

    return next
      .handle()
      .pipe(
        map((data: unknown) => {
          return TraceService.startManagedSpan('App | Validation Interceptor', { }, async () => {
            if (!responseClass) {
              return data;
            }

            const { transformOptions, ...validateOptions } = options;
            const configInstance = plainToClass(responseClass, data, transformOptions);
            const errors = await validate(configInstance as object, validateOptions);

            if (errors.length > 0) {
              throw new InternalServerErrorException({
                message: 'response validation failed',
                errors,
              });
            }

            return configInstance;
          });
        }),
      );
  }

}
