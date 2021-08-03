import { CallHandler, ExecutionContext, Injectable, NestInterceptor } from '@nestjs/common';
import { Observable } from 'rxjs';
import { finalize } from 'rxjs/operators';

import { LoggerService } from '../../logger/logger.service';
import { RequestService } from '../../request/request.service';

@Injectable()
export class AppLoggerInterceptor implements NestInterceptor {

  public constructor(
    private readonly loggerService: LoggerService,
    private readonly requestService: RequestService,
  ) { }

  /**
   * Print request and response data at console for debugging purposes.
   * @param context
   * @param next
   */
  public intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    const req = this.requestService.getRequest();
    const start = Date.now();

    const methodPath = `${req.routerMethod.padEnd(6, ' ')} ${req.routerPath}`;
    const ipAddress = this.requestService.getClientIp();
    const userAgent = req.headers['user-agent'];
    const logMessage = `${methodPath} | ${ipAddress} | ${userAgent}`;

    this.loggerService.http(`> ${logMessage}`);

    return next
      .handle()
      .pipe(
        finalize(() => {
          this.loggerService.http(`< ${logMessage} | ${Date.now() - start} ms`);
        }),
      );
  }

}
