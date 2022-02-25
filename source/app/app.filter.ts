import { Catch, ExceptionFilter, HttpException, HttpStatus } from '@nestjs/common';
import cycle from 'cycle';

import { ContextService } from '../context/context.service';
import { LoggerService } from '../logger/logger.service';
import { MetricService } from '../metric/metric.service';
import { AppConfig } from './app.config';
import { AppEnvironment } from './app.enum';
import { AppException, AppExceptionDetails, AppExceptionResponse } from './app.interface';
import { AppModule } from './app.module';

@Catch()
export class AppFilter implements ExceptionFilter {

  public constructor(
    private readonly appConfig: AppConfig,
    private readonly contextService: ContextService,
    private readonly loggerService: LoggerService,
    private readonly metricService: MetricService,
  ) { }

  /**
   * Intercepts all errors and standardize the output.
   * @param exception
   */
  public catch(exception: HttpException | Error): void {
    const appException: AppException = {
      exception,
      statusCode: this.getStatusCode(exception),
      message: this.getMessage(exception),
      details: this.getDetails(exception),
    };

    this.logException(appException);
    this.registerException(appException);
    this.sendResponse(appException);
  }

  /**
   * Given an exception, determines the correct status code.
   * @param exception
   */
  private getStatusCode(exception: HttpException | Error): HttpStatus {
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
  private getMessage(exception: HttpException | Error): string {
    let message;

    if (exception instanceof HttpException) {
      const details = exception.getResponse() as Record<string, any>;
      const status = exception.getStatus();

      if (status === HttpStatus.BAD_REQUEST && !details?.outboundResponse) {
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
      const status = exception.getStatus();

      if (status === HttpStatus.BAD_REQUEST && !details?.outboundResponse) {
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
   * Logs the incident according to `httpErrors` application option
   * Add request metadata removing sensitive information.
   * @param params
   */
  private logException(params: AppException): void {
    const { details, exception, message, statusCode } = params;
    const logData: Record<string, any> = { message, ...details };
    const httpErrors = AppModule.getOptions().httpErrors;

    if (httpErrors.includes(statusCode)) {
      const inboundRequest = {
        url: this.contextService.getRequestPath(),
        params: this.contextService.getRequestParams(),
        query: this.contextService.getRequestQuery(),
        body: this.contextService.getRequestBody(),
        headers: this.contextService.getRequestHeaders(),
        metadata: this.contextService.getMetadata(),
      };

      logData.inboundRequest = inboundRequest;
      this.loggerService.error(exception, logData);
    }
    else {
      this.loggerService.info(exception, logData);
    }
  }

  /**
   * Register exception metrics.
   * @param params
   */
  private registerException(params: AppException): void {
    const req = this.contextService.getRequest();
    const histogram = this.metricService.getHttpInboundHistogram();

    const { time, routerMethod, routerPath } = req;
    const { statusCode } = params;

    const latency = Date.now() - time;
    histogram.labels(routerMethod, routerPath, statusCode.toString()).observe(latency);
  }

  /**
   * Sends client response for given exception.
   * @param params
   */
  private sendResponse(params: AppException): void {
    const { details, message, statusCode } = params;
    const res = this.contextService.getResponse();

    const isProduction = this.appConfig.NODE_ENV === AppEnvironment.PRODUCTION;
    const isInternalError = statusCode === HttpStatus.INTERNAL_SERVER_ERROR;

    const filteredResponse: AppExceptionResponse = {
      code: statusCode,
      message: isProduction && isInternalError ? 'unexpected error' : message,
      ...isProduction && isInternalError ? { } : details,
    };

    const { proxyExceptions, outboundResponse } = details;
    const exceptionBody = outboundResponse?.body;

    const clientResponse: AppExceptionResponse = proxyExceptions && exceptionBody
      ? exceptionBody
      : filteredResponse;

    this.loggerService.http(this.contextService.getRequestDescription(statusCode));

    res.code(statusCode);
    res.header('Content-Type', 'application/json');
    res.send(clientResponse);
  }

}
