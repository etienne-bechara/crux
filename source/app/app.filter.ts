import { Catch, ExceptionFilter, HttpException, HttpStatus } from '@nestjs/common';
import cycle from 'cycle';

import { ContextService } from '../context/context.service';
import { LogService } from '../log/log.service';
import { AppConfig } from './app.config';
import { AppEnvironment } from './app.enum';
import { AppException, AppExceptionDetails, AppExceptionResponse } from './app.interface';
import { AppService } from './app.service';

@Catch()
export class AppFilter implements ExceptionFilter {

  public constructor(
    private readonly appConfig: AppConfig,
    private readonly appService: AppService,
    private readonly contextService: ContextService,
    private readonly logService: LogService,
  ) { }

  /**
   * Intercepts all errors and standardize the output.
   * @param exception
   */
  public catch(exception: HttpException | Error): void {
    try {
      const appException: AppException = {
        exception,
        code: this.getCode(exception),
        message: this.getMessage(exception),
        details: this.getDetails(exception),
      };

      this.logException(appException);
      this.appService.collectInboundTelemetry(appException.code, exception);
      this.sendResponse(appException);
    }
    catch (e) {
      this.logService.error('Failed to handle exception', e as Error);
    }
  }

  /**
   * Given an exception, determines the correct status code.
   * @param exception
   */
  private getCode(exception: HttpException | Error): HttpStatus {
    return exception?.['getStatus']?.()
      || exception?.['statusCode']
      || HttpStatus.INTERNAL_SERVER_ERROR;
  }

  /**
   * Given an exception, extracts a detailing message.
   * @param exception
   */
  private getMessage(exception: HttpException | Error): string {
    let message;

    if (exception instanceof HttpException) {
      const details = exception.getResponse() as Record<string, any>;
      const code = exception.getStatus();

      if (code === HttpStatus.BAD_REQUEST && !details?.outboundResponse) {
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
  private getDetails(exception: HttpException | Error): AppExceptionDetails {
    let details: AppExceptionDetails;

    if (exception instanceof HttpException) {
      details = exception.getResponse() as Record<string, any>;
      const code = exception.getStatus();

      if (code === HttpStatus.BAD_REQUEST && !details?.outboundResponse) {
        const arrayConstraints = Array.isArray(details.message)
          ? details.message
          : [ details.message ];

        const uniqueConstraints = [ ...new Set(arrayConstraints) ];

        details = { constraints: uniqueConstraints };
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
   * Logs the incident according to `httpErrors` application option
   * Add request metadata removing sensitive information.
   * @param params
   */
  private logException(params: AppException): void {
    const { details, exception, message, code } = params;
    const { httpErrors } = this.appConfig.APP_OPTIONS;

    const inboundRequest = {
      method: this.contextService.getRequestMethod(),
      host: this.contextService.getRequestHost(),
      path: this.contextService.getRequestPath(),
      params: this.contextService.getRequestParams(),
      query: this.contextService.getRequestQuery(),
      body: this.contextService.getRequestBody(),
      headers: this.contextService.getRequestHeaders(),
      metadata: this.contextService.getRequestMetadata(),
    };

    const data = { message, inboundRequest, ...details };

    return httpErrors.includes(code)
      ? this.logService.error(exception, data)
      : this.logService.info(exception, data);
  }

  /**
   * Sends client response for given exception.
   * @param params
   */
  private sendResponse(params: AppException): void {
    const { details, message, code } = params;
    const { filterResponseBody } = this.appConfig.APP_OPTIONS.logs || { };
    const res = this.contextService.getResponse();

    const isProduction = this.appConfig.NODE_ENV === AppEnvironment.PRODUCTION;
    const isInternalError = code === HttpStatus.INTERNAL_SERVER_ERROR;

    const filteredResponse: AppExceptionResponse = {
      code,
      message: isProduction && isInternalError ? 'unexpected error' : message,
      ...isProduction && isInternalError ? { } : details,
    };

    const { proxyExceptions, outboundResponse } = details;
    const exceptionBody = outboundResponse?.body;

    const clientResponse: AppExceptionResponse = proxyExceptions && exceptionBody
      ? exceptionBody
      : filteredResponse;

    this.logService.http(this.contextService.getRequestDescription('out'), {
      duration: this.contextService.getRequestDuration(),
      code,
      body: filterResponseBody ? undefined : clientResponse,
    });

    res.code(code);
    res.header('Content-Type', 'application/json');
    res.send(clientResponse);
  }

}
