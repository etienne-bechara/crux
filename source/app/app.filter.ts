import { ArgumentsHost, Catch, ExceptionFilter, HttpException, HttpStatus } from '@nestjs/common';
import { decycle } from 'cycle';

import { LoggerService } from '../logger/logger.service';
import { AppConfig } from './app.config';
import { AppEnvironment } from './app.enum';
import { AppException, AppRequest, AppResponse } from './app.interface';

@Catch()
export class AppFilter implements ExceptionFilter {

  public constructor(
    private readonly appConfig: AppConfig,
    private readonly loggerService: LoggerService,
  ) { }

  /**
   * Intercepts all errors and standardize the output.
   * @param exception
   * @param host
   */
  public catch(exception: HttpException | Error, host: ArgumentsHost): void {
    const req: AppRequest = host.switchToHttp().getRequest();
    const res: AppResponse = host.switchToHttp().getResponse();

    const appException: AppException = {
      exception,
      errorCode: this.getErrorCode(exception),
      message: this.getMessage(exception),
      details: this.getDetails(exception),
    };

    this.logException(appException, req);

    const productionServerError =
      this.appConfig.NODE_ENV === AppEnvironment.PRODUCTION
      && appException.errorCode === HttpStatus.INTERNAL_SERVER_ERROR;

    res.setHeader('Content-Type', 'application/json');
    res.statusCode = appException.errorCode;
    res.end(JSON.stringify({
      error: appException.errorCode,
      message: !productionServerError
        ? appException.message
        : 'unexpected error',
      details: !productionServerError
        ? appException.details
        : { },
    }));
  }

  /**
   * Given an exception, determines the correct status code.
   * @param exception
   */
  private getErrorCode(exception: HttpException | Error): number {
    return exception instanceof HttpException
      ? exception.getStatus()
      : HttpStatus.INTERNAL_SERVER_ERROR;
  }

  /**
   * Given an exception, extracts a detailing message.
   * @param exception
   */
  private getMessage(exception: HttpException | Error): string {
    let message;

    if (exception instanceof HttpException) {
      const status = exception.getStatus();
      message = exception.getResponse();

      if (status === HttpStatus.BAD_REQUEST) {
        message = 'request validation failed';
      }
      else if (message && typeof message === 'object') {
        if (message['message'] && typeof message['message'] === 'string') {
          message = message['message'];
        }
      }
    }
    else {
      message = exception.message;
    }

    return message && typeof message === 'string'
      ? message
      : 'unexpected error';
  }

  /**
   * Given an exception, extracts its details.
   * Ensures that circular references are eliminated.
   * @param exception
   */
  private getDetails(exception: HttpException | Error): unknown {
    let details: unknown;

    if (exception instanceof HttpException) {
      const status = exception.getStatus();
      details = exception.getResponse();

      if (status === HttpStatus.BAD_REQUEST) {
        const constraints = Array.isArray(details['message'])
          ? details['message']
          : [ details['message'] ];
        details = { constraints };
      }
      else if (details && typeof details === 'object') {
        delete details['statusCode'];
        delete details['message'];
        delete details['error'];
      }
    }

    return decycle(details) || { };
  }

  /**
   * Logs the incident according to status:
   * • Error level for INTERNAL_SERVER_ERROR
   * • Info level for everything else.
   *
   * Always add request data removing sensitive
   * information.
   * @param appException
   * @param req
   */
  private logException(appException: AppException, req: AppRequest): void {
    const logData = {
      message: appException.message,
      details: appException.details,
    };

    if (appException.errorCode === HttpStatus.INTERNAL_SERVER_ERROR) {
      this.loggerService.error(appException.exception, {
        message: logData.message,
        ...logData.details,
        inbound_request: {
          url: req.url,
          headers: this.removeSensitiveData(req.headers),
          params: this.removeSensitiveData(req.params),
          query: this.removeSensitiveData(req.query),
          body: this.removeSensitiveData(req.body),
          metadata: req.metadata,
        },
      });
    }
    else {
      this.loggerService.info(appException.exception, logData);
    }
  }

  /**
   * Check if object has any keys and remove sensitive
   * data form them
   * If empty, return undefined to send less data.
   * @param object
   */
  private removeSensitiveData(object: any): any {
    if (!object || typeof object !== 'object' || Object.keys(object).length === 0) {
      return;
    }

    delete object.authorization;
    return object;
  }

}
