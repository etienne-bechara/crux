import { CallHandler, ExecutionContext, Injectable, NestInterceptor } from '@nestjs/common';
import { finalize } from 'rxjs/operators';

import { LoggerService } from '../../logger/logger.service';
import { AppRequest, AppResponse } from '../app.interface';

@Injectable()
export class AppLoggerInterceptor implements NestInterceptor {

  public constructor(
    private readonly loggerService: LoggerService,
  ) { }

  /**
   * Print request and response data at console for debugging purposes.
   * @param context
   * @param next
   */
  public intercept(context: ExecutionContext, next: CallHandler): any {
    const req: AppRequest = context.switchToHttp().getRequest();
    const start = Date.now();

    const reqTarget = `${req.method.padEnd(6, ' ')} ${req.originalUrl.split('?')[0]}`;
    this.loggerService.http(`> ${reqTarget} | ${req.metadata.clientIp} | ${req.metadata.userAgent}`);

    return next
      .handle()
      .pipe(
        finalize(() => {
          const res: AppResponse = context.switchToHttp().getResponse();
          this.loggerService.http(`< ${reqTarget} | ${res.statusCode} | ${Date.now() - start} ms`);
        }) as any,
      );
  }

}
