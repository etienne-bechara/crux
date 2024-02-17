import { CallHandler, ExecutionContext, Injectable, InternalServerErrorException, NestInterceptor } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { ClassConstructor, plainToClass } from 'class-transformer';
import { validate } from 'class-validator';
import { map, Observable } from 'rxjs';

import { AppMetadataKey } from '../app/app.enum';
import { TraceService } from '../trace/trace.service';

@Injectable()
export class ValidateInterceptor implements NestInterceptor {

  public constructor(
    public readonly reflector: Reflector,
  ) { }

  /**
   * Add tracing and response body validation support.
   * @param context
   * @param next
   */
  public intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    const responseClass: ClassConstructor<unknown> = this.reflector.get(
      AppMetadataKey.RESPONSE_CLASS,
      context.getHandler(),
    );

    return next
      .handle()
      .pipe(
        map((data: any) => {
          return TraceService.startManagedSpan('App | Validation Interceptor', { }, async () => {
            if (!responseClass) {
              return data;
            }

            const configInstance = plainToClass(responseClass, data, {
              ignoreDecorators: true,
            });

            const errors = await validate(configInstance as object, {
              whitelist: true,
              forbidNonWhitelisted: true,
              skipNullProperties: true,
              validationError: {
                target: false,
              },
            });

            if (errors.length > 0) {
              throw new InternalServerErrorException({
                message: 'response validation failed',
                errors,
              });
            }

            return plainToClass(responseClass, data);
          });
        }),
      );
  }

}
