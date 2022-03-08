import { Catch, ExceptionFilter, HttpException, HttpStatus } from '@nestjs/common';
import cycle from 'cycle';

import { ContextService } from '../context/context.service';
import { LoggerService } from '../logger/logger.service';
import { MetricService } from '../metric/metric.service';
import { AppConfig } from './app.config';
import { AppEnvironment } from './app.enum';
import { AppException, AppExceptionDetails, AppExceptionResponse } from './app.interface';

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
      code: this.getCode(exception),
      message: this.getMessage(exception),
      details: this.getDetails(exception),
    };

    this.logException(appException);
    this.collectExceptionMetrics(appException);
    this.sendResponse(appException);
  }

  /**
   * Given an exception, determines the correct status code.
   * @param exception
   */
  private getCode(exception: HttpException | Error): HttpStatus {
    let code: HttpStatus;

    if (exception instanceof HttpException) {
      code = exception.getStatus();
    }
    else if (exception.message?.includes('body is too large')) {
      code = HttpStatus.PAYLOAD_TOO_LARGE;
    }

    return code || HttpStatus.INTERNAL_SERVER_ERROR;
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
      path: this.contextService.getRequestPath(),
      params: this.contextService.getRequestParams(),
      query: this.contextService.getRequestQuery(),
      body: this.contextService.getRequestBody(),
      headers: this.contextService.getRequestHeaders(),
      metadata: this.contextService.getMetadata(),
    };

    const data = { message, inboundRequest, ...details };

    return httpErrors.includes(code)
      ? this.loggerService.error(exception, data)
      : this.loggerService.info(exception, data);
  }

  /**
   * Register exception metrics.
   * @param params
   */
  private collectExceptionMetrics(params: AppException): void {
    const { code } = params;

    const histogram = this.metricService?.getHttpInboundHistogram();
    if (!histogram) return;

    const latency = this.contextService.getRequestLatency();
    const method = this.contextService.getRequestMethod();
    const path = this.contextService.getRequestPath();

    histogram.labels(method, path, code.toString()).observe(latency);
  }

  /**
   * Sends client response for given exception.
   * @param params
   */
  private sendResponse(params: AppException): void {
    const { details, message, code } = params;
    const res = this.contextService.getResponse();

    const isProduction = this.appConfig.NODE_ENV === AppEnvironment.PRODUCTION;
    const isInternalError = code === HttpStatus.INTERNAL_SERVER_ERROR;

    const filteredResponse: AppExceptionResponse = {
      code: code,
      message: isProduction && isInternalError ? 'unexpected error' : message,
      ...isProduction && isInternalError ? { } : details,
    };

    const { proxyExceptions, outboundResponse } = details;
    const exceptionBody = outboundResponse?.body;

    const clientResponse: AppExceptionResponse = proxyExceptions && exceptionBody
      ? exceptionBody
      : filteredResponse;

    this.loggerService.http(this.contextService.getRequestDescription(code));

    res.code(code);
    res.header('Content-Type', 'application/json');
    res.send(clientResponse);
  }

}
