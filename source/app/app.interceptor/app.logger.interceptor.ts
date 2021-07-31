import { CallHandler, ExecutionContext, Injectable, NestInterceptor } from '@nestjs/common';
import { Observable } from 'rxjs';
import { finalize } from 'rxjs/operators';

import { LoggerService } from '../../logger/logger.service';
import { RequestService } from '../../request/request.service';
import { AppResponse } from '../app.interface';

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
  public intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    const requestService = RequestService.getInstanceFromContext(context);
    const req = requestService.getRequest();
    const start = Date.now();

    const methodPath = `${req.routerMethod.padEnd(6, ' ')} ${req.routerPath}`;
    const ipAddress = requestService.getClientIp();
    const userAgent = req.headers['user-agent'];

    this.loggerService.http(`> ${methodPath} | ${ipAddress} | ${userAgent}`);

    return next
      .handle()
      .pipe(
        finalize(() => {
          const res: AppResponse = context.switchToHttp().getResponse();
          this.loggerService.http(`< ${methodPath} | ${res.statusCode} | ${Date.now() - start} ms`);
        }),
      );
  }

}
