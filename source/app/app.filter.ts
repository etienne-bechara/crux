import { Catch, ExceptionFilter, HttpException, HttpStatus } from '@nestjs/common';
import { decycle } from 'cycle';

import { LoggerService } from '../logger/logger.service';
import { RequestService } from '../request/request.service';
import { UtilService } from '../util/util.service';
import { AppConfig } from './app.config';
import { AppEnvironment } from './app.enum';
import { AppException, AppExceptionDetails, AppExceptionResponse } from './app.interface';
import { AppModule } from './app.module';

@Catch()
export class AppFilter implements ExceptionFilter {

  public constructor(
    protected readonly appConfig: AppConfig,
    protected readonly loggerService: LoggerService,
    protected readonly requestService: RequestService,
    protected readonly utilService: UtilService,
  ) { }

  /**
   * Intercepts all errors and standardize the output.
   * @param exception
   */
  public catch(exception: HttpException | Error): void {
    const res = this.requestService.getResponse();

    const appException: AppException = {
      exception,
      errorCode: this.getErrorCode(exception),
      message: this.getMessage(exception),
      details: this.getDetails(exception),
    };

    this.logException(appException);

    const productionError =
      this.appConfig.NODE_ENV === AppEnvironment.PRODUCTION
      && appException.errorCode === HttpStatus.INTERNAL_SERVER_ERROR;

    const filteredResponse: AppExceptionResponse = {
      code: appException.errorCode,
      message: productionError ? 'unexpected error' : appException.message,
      ...productionError ? { } : appException.details,
    };

    const outboundResponse: AppExceptionResponse = appException.details.proxyExceptions
      ? appException.details.externalResponse?.body
      : filteredResponse;

    res.code(appException.errorCode);
    res.header('Content-Type', 'application/json');
    res.send(outboundResponse);
  }

  /**
   * Given an exception, determines the correct status code.
   * @param exception
   */
  protected getErrorCode(exception: HttpException | Error): HttpStatus {
    let errorCode: HttpStatus;

    if (exception instanceof HttpException) {
      errorCode = exception.getStatus();
    }
    else if (exception.message?.includes('body is too large')) {
      errorCode = HttpStatus.PAYLOAD_TOO_LARGE;
    }

    return errorCode || HttpStatus.INTERNAL_SERVER_ERROR;
  }

  /**
   * Given an exception, extracts a detailing message.
   * @param exception
   */
  protected getMessage(exception: HttpException | Error): string {
    let message;

    if (exception instanceof HttpException) {
      const details = exception.getResponse() as Record<string, any>;
      const status = exception.getStatus();

      if (status === HttpStatus.BAD_REQUEST && !details?.externalResponse) {
        message = 'request validation failed';
      }
      else if (details?.message && typeof details.message === 'string') {
        message = details.message;
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
  protected getDetails(exception: HttpException | Error): AppExceptionDetails {
    let details: AppExceptionDetails;

    if (exception instanceof HttpException) {
      details = exception.getResponse() as Record<string, any>;
      const status = exception.getStatus();

      if (status === HttpStatus.BAD_REQUEST && !details?.externalResponse) {
        const constraints = Array.isArray(details.message)
          ? details.message
          : [ details.message ];
        details = { constraints };
      }
      else if (details && typeof details === 'object') {
        delete details.statusCode;
        delete details.message;
        delete details.error;
      }
    }

    return decycle(details) || { };
  }

  /**
   * Logs the incident according to status:
   * - Error level for INTERNAL_SERVER_ERROR
   * - Info level for everything else.
   *
   * Always add request data removing sensitive
   * information.
   * @param appException
   */
  protected logException(appException: AppException): void {
    const { details, exception, message, errorCode } = appException;
    const logData: Record<string, any> = { message, ...details };
    const httpErrors = AppModule.getOptions().httpErrors;
    const req = this.requestService.getRequest();

    if (httpErrors.includes(errorCode)) {
      const clientRequest = {
        url: req.url.split('?')[0],
        params: req.params && Object.keys(req.params).length > 0 ? req.params : undefined,
        query: req.query && Object.keys(req.query).length > 0 ? req.query : undefined,
        body: req.body && Object.keys(req.body).length > 0 ? req.body : undefined,
        headers: req.headers && Object.keys(req.headers).length > 0 ? req.headers : undefined,
        metadata: this.requestService.getMetadata(),
      };

      logData.clientRequest = clientRequest;
      this.loggerService.error(exception, logData);
    }
    else {
      this.loggerService.info(exception, logData);
    }
  }

}
