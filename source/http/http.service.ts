import { HttpException, HttpStatus, Inject, Injectable, InternalServerErrorException, Scope } from '@nestjs/common';
import { propagation, SpanStatusCode } from '@opentelemetry/api';
import { SemanticAttributes } from '@opentelemetry/semantic-conventions';
import got, { Got } from 'got';
import { IncomingHttpHeaders } from 'http';

import { AppMetric } from '../app/app.enum';
import { LogService } from '../log/log.service';
import { MetricService } from '../metric/metric.service';
import { TraceService } from '../trace/trace.service';
import { HttpConfig } from './http.config';
import { HttpInjectionToken, HttpMethod } from './http.enum';
import { HttpCookie, HttpExceptionParams, HttpModuleOptions, HttpRequestParams, HttpRequestSendParams, HttpResponse, HttpRetryParams, HttpTelemetryParams } from './http.interface';

@Injectable({ scope: Scope.TRANSIENT })
export class HttpService {

  private instance: Got;

  public constructor(
    @Inject(HttpInjectionToken.HTTP_MODULE_OPTIONS)
    private readonly httpModuleOptions: HttpModuleOptions = { },
    private readonly httpConfig: HttpConfig,
    private readonly logService: LogService,
    private readonly metricService: MetricService,
    private readonly traceService: TraceService,
  ) {
    if (this.httpModuleOptions.disableTelemetry) {
      this.logService = undefined;
      this.metricService = undefined;
      this.traceService = undefined;
    }

    this.setup();
  }

  /**
   * Returns the underlying GOT client.
   */
  public getInstance(): Got {
    return this.instance;
  }

  /**
   * Creates new HTTP instance based on GOT.
   *
   * Adds a hook to destroy p-cancellable request in order to prevent exceptions
   * when fulfilling a request asynchronously.
   */
  private setup(): void {
    const { name, prefixUrl } = this.httpModuleOptions;
    this.logService?.debug(`Creating HTTP instance for ${name || prefixUrl}`);

    this.httpModuleOptions.hooks ??= {
      afterResponse: [
        (res): any => {
          const { statusCode, request } = res;
          const limitStatusCode = request.options.followRedirect ? 299 : 399;
          const isSuccess = statusCode >= 200 && statusCode <= limitStatusCode || statusCode === 304;
          if (isSuccess) request.destroy();
          return res;
        },
      ],
    };

    this.instance = got.extend({
      ...this.httpModuleOptions,
      retry: 0,
    });
  }

  /**
   * Merge request retry options with module level and calculate
   * maximum limit as well as return allowed codes and delay.
   * @param params
   */
  private buildRetryParams(params: HttpRequestParams): HttpRetryParams {
    const { method: paramsMethod, retryLimit: paramsLimit, retryCodes: paramsCode, retryDelay: paramsDelay } = params;

    const retryLimitBase = paramsLimit ?? this.httpModuleOptions.retryLimit ?? this.httpConfig.HTTP_DEFAULT_RETRY_LIMIT;
    const retryMethods = this.httpModuleOptions.retryMethods ?? this.httpConfig.HTTP_DEFAULT_RETRY_METHODS;
    const retryCodes = paramsCode ?? this.httpModuleOptions.retryCodes ?? this.httpConfig.HTTP_DEFAULT_RETRY_CODES;
    const retryDelay = paramsDelay ?? this.httpModuleOptions.retryDelay ?? this.httpConfig.HTTP_DEFAULT_RETRY_DELAY;

    const method: HttpMethod = paramsMethod as any || HttpMethod.GET;
    const isRetryable = !!paramsLimit || paramsLimit === 0 || retryMethods.includes(method);
    const retryLimit = isRetryable ? retryLimitBase + 1 : 1;

    return { retryLimit, retryCodes, retryDelay, attempt: 0 };
  }

  /**
   * Given a request configuration, replace URL variables that matches
   * :param_name to its equivalent at replacements property.
   * @param url
   * @param params
   */
  private buildRequestUrl(url: string, params: HttpRequestParams): string {
    const { replacements } = params;
    let replacedUrl = url;

    if (replacements) {
      for (const key in replacements) {
        const replacement = typeof replacements[key] === 'string'
          ? replacements[key]
          : replacements[key]?.toString?.();

        if (!replacement || typeof replacement !== 'string') {
          throw new InternalServerErrorException(`path replacement ${key} must be a defined string`);
        }

        const replaceRegex = new RegExp(`:${key}`, 'g');
        const value = encodeURIComponent(replacements[key].toString());
        replacedUrl = replacedUrl.replace(replaceRegex, value);
      }
    }

    return replacedUrl;
  }

  /**
   * Apply to request params:
   * - Set `method` as GET if not provided
   * - Set `resolveBodyOnly` as false as we always want the full response
   * - Merge `query`, `json` and `form` with provided options at module
   * - Convert query string arrays into strings joined with configured separator.
   * @param params
   */
  private buildRequestParams(params: HttpRequestParams): HttpRequestParams {
    const { query, querySeparator, json, form } = params;

    params.method ??= HttpMethod.GET;
    params.resolveBodyOnly = false;

    if (query || this.httpModuleOptions.query) {
      const separator = querySeparator ?? this.httpModuleOptions.querySeparator ?? ',';
      const mergedQuery = { ...this.httpModuleOptions.query, ...query };

      for (const key in mergedQuery) {
        const testValue = mergedQuery[key];

        if (Array.isArray(testValue)) {
          mergedQuery[key] = testValue.join(separator);
        }
        else if (testValue?.toString) {
          mergedQuery[key] = testValue.toString();
        }
      }

      params.searchParams = mergedQuery as Record<string, string>;
    }

    if (json) {
      params.json = { ...this.httpModuleOptions.json, ...json };
    }

    if (form) {
      params.form = { ...this.httpModuleOptions.form, ...form };
    }

    return params;
  }

  /**
   * Build log message for outbound request.
   * @param step
   * @param params
   */
  private buildLogMessage(step: 'up' | 'down', params: Partial<HttpTelemetryParams>): string {
    const { method, host, path } = params;

    return step === 'down'
      ? `⯆ ${method} ${host}${path}`
      : `⯅ ${method} ${host}${path}`;
  }

  /**
   * Build all necessary variables for telemetry as well as start
   * upstream request span.
   * @param url
   * @param params
   */
  private buildTelemetryParams(url: string, params: HttpRequestParams): HttpTelemetryParams {
    const { prefixUrl, method, replacements, query, body: rawBody, json, form, headers } = params;

    const finalPrefix = this.httpModuleOptions.prefixUrl || prefixUrl;
    const finalUrl = url.startsWith('http') ? new URL(url) : new URL(`${finalPrefix}/${url}`);

    const { host, pathname: path } = finalUrl;
    const start = Date.now();
    const body = rawBody || json || form;
    const spanName = this.buildLogMessage('up', { method, host, path });

    const span = this.traceService?.startSpan(spanName, {
      attributes: {
        [SemanticAttributes.HTTP_METHOD]: method,
        [SemanticAttributes.HTTP_HOST]: host,
        [SemanticAttributes.HTTP_ROUTE]: path,
      },
    });

    return { start, method, host, path, replacements, query, body, headers, span };
  }

  /**
   * Handles all requests, extending GOT functionality with:
   * - Path variables replacement
   * - Search param array joining
   * - Improved exception logging containing response
   * - Response exception proxying to client.
   * - Response cookie parsing.
   *
   * At the end of external request, regardless of status,
   * register duration at outbound histogram.
   * @param url
   * @param params
   */
  public async request<T>(url: string, params: HttpRequestParams): Promise<T> {
    const { ignoreExceptions, resolveBodyOnly } = params;
    let response: any;

    const sendParams: HttpRequestSendParams = {
      url: this.buildRequestUrl(url, params),
      request: this.buildRequestParams(params),
      ignoreExceptions: ignoreExceptions ?? this.httpModuleOptions.ignoreExceptions,
      resolveBodyOnly: resolveBodyOnly ?? this.httpModuleOptions.resolveBodyOnly,
      telemetry: this.buildTelemetryParams(url, params),
      retry: this.buildRetryParams(params),
    };

    while (!response) {
      try {
        sendParams.retry.attempt++;
        response = await this.sendRequest(sendParams);
      }
      catch (e) {
        const { attempt, retryLimit, retryCodes, retryDelay } = sendParams.retry;
        const attemptResponse = e.response?.outboundResponse;
        const isRetryableCode = !attemptResponse?.code || retryCodes.includes(attemptResponse?.code as HttpStatus);
        const attemptsLeft = retryLimit - attempt;

        if (!attemptsLeft || !isRetryableCode) {
          this.collectOutboundTelemetry('result', { ...sendParams.telemetry, response: attemptResponse, error: e });
          throw e;
        }

        const delay = retryDelay(attempt);
        this.logService?.warning({ attempt, retryLimit, retryDelay: delay }, e as Error);

        await new Promise((r) => setTimeout(r, delay));
      }
    }

    if (response) {
      const headers: IncomingHttpHeaders = response.headers;
      response.cookies = this.parseCookies(headers);
    }

    this.collectOutboundTelemetry('result', { ...sendParams.telemetry, response });

    return sendParams.resolveBodyOnly
      ? response?.body
      : response;
  }

  /**
   * Executes a request ensuring log and metrics collection.
   * @param params
   */
  private async sendRequest<T>(params: HttpRequestSendParams): Promise<HttpResponse<T>> {
    const { url, request, telemetry, retry, ignoreExceptions } = params;
    const { method, host, path, replacements, query, body, headers, span: parentSpan } = telemetry;
    const { attempt, retryLimit } = retry;
    const logMessage = this.buildLogMessage('up', { method, host, path });
    const start = Date.now();
    let response: HttpResponse<T>;

    const span = this.traceService?.startSpan(`⯆ ${method} ${host}${path} | #${attempt}/${retryLimit}`, {
      attributes: {
        [SemanticAttributes.HTTP_METHOD]: method,
        [SemanticAttributes.HTTP_HOST]: host,
        [SemanticAttributes.HTTP_ROUTE]: path,
      },
    }, this.traceService?.getSpanContext(parentSpan));

    if (span && !this.httpModuleOptions.disablePropagation) {
      request.headers ??= { };
      const ctx = this.traceService.getSpanContext(span);
      propagation.inject(ctx, request.headers);
    }

    try {
      this.logService?.http(logMessage, { method, host, path, replacements, query, body, headers });
      response = await this.instance(url, request) as HttpResponse<T>;

      this.collectOutboundTelemetry('iteration', { ...telemetry, start, response, span });
    }
    catch (e) {
      const isTimeout = /timeout/i.test(e.message as string);
      const errorResponse = e.response || { statusCode: HttpStatus.GATEWAY_TIMEOUT };

      this.collectOutboundTelemetry('iteration', { ...telemetry, start, response: errorResponse, span, error: e });

      if (!isTimeout && !e.response) {
        throw e;
      }
      else if (ignoreExceptions) {
        response = errorResponse;
      }
      else {
        this.handleRequestException({ ...telemetry, error: e, request });
      }
    }

    return response;
  }

  /**
   * Given http response headers, acquire its parsed cookies.
   * @param headers
   */
  private parseCookies(headers: IncomingHttpHeaders): HttpCookie[] {
    const setCookie = headers?.['set-cookie'];
    const cookies: HttpCookie[] = [ ];
    if (!setCookie) return cookies;

    for (const cookie of setCookie) {
      const name = /^(.+?)=/gi.exec(cookie);
      const value = /^.+?=(.+?)(?:$|;)/gi.exec(cookie);
      const path = /path=(.+?)(?:$|;)/gi.exec(cookie);
      const domain = /domain=(.+?)(?:$|;)/gi.exec(cookie);
      const expires = /expires=(.+?)(?:$|;)/gi.exec(cookie);
      if (!name || !value) continue;

      cookies.push({
        name: name[1],
        value: value[1],
        path: path ? path[1] : null,
        domain: domain ? domain[1] : null,
        expires: expires ? new Date(expires[1]) : null,
      });
    }

    return cookies;
  }

  /**
   * Register logs, metrics and tracing of outbound request.
   * @param step
   * @param params
   */
  private collectOutboundTelemetry(step: 'result' | 'iteration', params: HttpTelemetryParams): void {
    const { start, method, host, path, response, span, error } = params;
    const { statusCode, body, headers } = response || { };
    const duration = (Date.now() - start) / 1000;

    if (step === 'iteration') {
      const strCode = statusCode?.toString() || '';
      const logData = { duration, code: strCode, body: body || undefined, headers };
      this.logService?.http(this.buildLogMessage('down', params), logData);

      const durationHistogram = this.metricService?.getHistogram(AppMetric.HTTP_OUTBOUND_DURATION);

      if (durationHistogram) {
        durationHistogram.labels(method, host, path, strCode).observe(duration);
      }
    }

    if (span) {
      span.setAttributes({
        [SemanticAttributes.HTTP_STATUS_CODE]: statusCode || undefined,
        'http.duration': duration,
      });

      if (error) {
        span.recordException(error);
        span.setStatus({ code: SpanStatusCode.ERROR, message: error.message });
      }
      else {
        span.setStatus({ code: SpanStatusCode.OK });
      }

      span.end();
    }
  }

  /**
   * Standardize the output in case of a request exception in the format:
   * {method} {url} | {error message}.
   *
   * If the proxy option has been set, throws a NestJS http
   * exception with matching code.
   * @param params
   */
  private handleRequestException(params: HttpExceptionParams): void {
    const { method, host, path, request, error } = params;
    const { message, response } = error;
    const { proxyExceptions, body } = request;
    const isProxyExceptions = proxyExceptions ?? this.httpModuleOptions.proxyExceptions;

    const code: HttpStatus = isProxyExceptions && response?.statusCode
      ? response?.statusCode
      : HttpStatus.INTERNAL_SERVER_ERROR;

    delete request.url;

    throw new HttpException({
      message: `⯆ ${method} ${host}${path} | ${message}`,
      proxyExceptions: isProxyExceptions,
      outboundRequest: {
        method,
        host,
        path,
        ...request,
        body,
      },
      outboundResponse: {
        code: response?.statusCode,
        headers: response?.headers,
        body: response?.body,
      },
    }, code);
  }

  /**
   * Send a GET request.
   * @param url
   * @param params
   */
  public async get<T>(url: string, params: HttpRequestParams = { }): Promise<T> {
    return this.request<T>(url, { ...params, method: HttpMethod.GET });
  }

  /**
   * Send a HEAD request.
   * @param url
   * @param params
   */
  public async head<T>(url: string, params: HttpRequestParams = { }): Promise<T> {
    return this.request<T>(url, { ...params, method: HttpMethod.HEAD });
  }

  /**
   * Send a POST request.
   * @param url
   * @param params
   */
  public async post<T>(url: string, params: HttpRequestParams = { }): Promise<T> {
    return this.request<T>(url, { ...params, method: HttpMethod.POST });
  }

  /**
   * Send a PUT request.
   * @param url
   * @param params
   */
  public async put<T>(url: string, params: HttpRequestParams = { }): Promise<T> {
    return this.request<T>(url, { ...params, method: HttpMethod.PUT });
  }

  /**
   * Send a DELETE request.
   * @param url
   * @param params
   */
  public async delete<T>(url: string, params: HttpRequestParams = { }): Promise<T> {
    return this.request<T>(url, { ...params, method: HttpMethod.DELETE });
  }

  /**
   * Send an OPTIONS request.
   * @param url
   * @param params
   */
  public async options<T>(url: string, params: HttpRequestParams = { }): Promise<T> {
    return this.request<T>(url, { ...params, method: HttpMethod.OPTIONS });
  }

  /**
   * Send a PATCH request.
   * @param url
   * @param params
   */
  public async patch<T>(url: string, params: HttpRequestParams = { }): Promise<T> {
    return this.request<T>(url, { ...params, method: HttpMethod.PATCH });
  }

}
