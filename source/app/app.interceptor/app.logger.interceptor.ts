import { CallHandler, ExecutionContext, Injectable, NestInterceptor } from '@nestjs/common';
import { Observable } from 'rxjs';
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
  public intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    const req: AppRequest = context.switchToHttp().getRequest();
    const start = Date.now();

    const methodPath = `${req.routerMethod.padEnd(6, ' ')} ${req.routerPath}`;
    const ipAddress = req.raw.metadata.remoteIp || req.ips?.[req.ips.length - 1] || req.ip;
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
