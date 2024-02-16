import { CallHandler, ClassSerializerInterceptor, ExecutionContext, Injectable, InternalServerErrorException, NestInterceptor, PlainLiteralObject } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { ClassConstructor, plainToClass } from 'class-transformer';
import { validate } from 'class-validator';
import { map, Observable } from 'rxjs';

import { AppReflectorKey } from '../app/app.enum';
import { TraceService } from '../trace/trace.service';

@Injectable()
export class TransformInterceptor extends ClassSerializerInterceptor implements NestInterceptor {

  public constructor(
    public readonly reflector: Reflector,
  ) {
    super(reflector);
  }

  /**
   * Overwrite behaviour of built in NestJS serializar by adding tracing
   * and response body validation support.
   * @param context
   * @param next
   */
  public intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    const contextOptions = this.getContextOptions(context);
    const options = { ...this.defaultOptions, ...contextOptions };
    const responseClass = this.reflector.get(AppReflectorKey.RESPONSE_BODY, context.getHandler());

    return next
      .handle()
      .pipe(
        map((res: PlainLiteralObject | PlainLiteralObject[]) => {
          return TraceService.startManagedSpan('App | Serialization Interceptor', { }, async () => {
            if (responseClass) {
              const configInstance = plainToClass(responseClass as ClassConstructor<unknown>, res);

              const errors = await validate(configInstance as object, {
                whitelist: true,
                forbidNonWhitelisted: true,
                always: true,
                strictGroups: true,
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
            }

            return this.serialize(res, options);
          });
        }),
      );
  }

}
