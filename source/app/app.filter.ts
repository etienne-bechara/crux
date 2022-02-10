import { Catch, ExceptionFilter, HttpException, HttpStatus } from '@nestjs/common';
import cycle from 'cycle';

import { ContextStorageKey } from '../context/context.enum';
import { ContextService } from '../context/context.service';
import { LoggerService } from '../logger/logger.service';
import { AppConfig } from './app.config';
import { AppEnvironment } from './app.enum';
import { AppException, AppExceptionDetails, AppExceptionResponse } from './app.interface';
import { AppModule } from './app.module';

@Catch()
export class AppFilter implements ExceptionFilter {

  public constructor(
    protected readonly appConfig: AppConfig,
    protected readonly contextService: ContextService,
    protected readonly loggerService: LoggerService,
  ) { }

  /**
   * Intercepts all errors and standardize the output.
   * @param exception
   */
  public catch(exception: HttpException | Error): void {
    const res = this.contextService.getResponse();

    const errorCode = this.getErrorCode(exception);
    const message = this.getMessage(exception);
    const details = this.getDetails(exception);
    this.logException({ exception, errorCode, message, details });

    const isProduction = this.appConfig.NODE_ENV === AppEnvironment.PRODUCTION;
    const isInternalError = errorCode === HttpStatus.INTERNAL_SERVER_ERROR;

    const filteredResponse: AppExceptionResponse = {
      code: errorCode,
      message: isProduction && isInternalError ? 'unexpected error' : message,
      ...isProduction && isInternalError ? { } : details,
    };

    const { proxyExceptions, externalResponse } = details;
    const exceptionBody = externalResponse?.body;
    const outboundResponse: AppExceptionResponse = proxyExceptions && exceptionBody ? exceptionBody : filteredResponse;

    res.code(errorCode);
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

    return cycle.decycle(details) || { };
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
    const req = this.contextService.getRequest();

    if (httpErrors.includes(errorCode)) {
      const clientRequest = {
        url: req.url.split('?')[0],
        params: this.validateObjectLength(req.params),
        query: this.validateObjectLength(req.query),
        body: this.validateObjectLength(req.body),
        headers: this.validateObjectLength(req.headers),
        metadata: this.contextService.getStore().get(ContextStorageKey.METADATA) || { },
      };

      logData.clientRequest = clientRequest;
      this.loggerService.error(exception, logData);
    }
    else {
      this.loggerService.info(exception, logData);
    }
  }

  /**
   * Ensures target object is valid and contain at least one key,
   * if not return as `undefined`.
   * @param obj
   */
  private validateObjectLength(obj: any): any {
    // eslint-disable-next-line @typescript-eslint/no-unsafe-argument
    return obj && Object.keys(obj).length > 0 ? obj : undefined;
  }

}
