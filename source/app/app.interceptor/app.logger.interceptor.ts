import { CallHandler, ExecutionContext, Injectable, NestInterceptor } from '@nestjs/common';
import { Observable } from 'rxjs';
import { finalize } from 'rxjs/operators';

import { LoggerService } from '../../logger/logger.service';
import { AppConfig } from '../app.config';
import { AppEnvironment } from '../app.enum';
import { AppRequest, AppResponse } from '../app.interface';

@Injectable()
export class AppLoggerInterceptor implements NestInterceptor {

  public constructor(
    private readonly appConfig: AppConfig,
    private readonly loggerService: LoggerService,
  ) { }

  /**
   * Print request and response data at console for debugging purposes.
   * @param context
   * @param next
   */
  public intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    const req: AppRequest = context.switchToHttp().getRequest();
    const start = new Date().getTime();

    const reqTarget = `${req.method.padEnd(6, ' ')} ${req.url}`;

    if (this.appConfig.NODE_ENV === AppEnvironment.LOCAL) {
      this.loggerService.http(`> ${reqTarget} | ${req.metadata.clientIp} | ${req.metadata.userAgent}`);
    }

    return next
      .handle()
      .pipe(
        finalize(() => {
          const res: AppResponse = context.switchToHttp().getResponse();
          this.loggerService.http(`< ${reqTarget} | ${res.statusCode} | ${new Date().getTime() - start} ms`);
        }),
      );
  }

}
