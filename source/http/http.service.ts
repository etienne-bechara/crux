import { HttpException, HttpStatus, Inject, Injectable, InternalServerErrorException, Scope } from '@nestjs/common';
import { SemanticAttributes } from '@opentelemetry/semantic-conventions';
import got, { Got } from 'got';
import { IncomingHttpHeaders } from 'http';

import { AppMetric } from '../app/app.enum';
import { LogService } from '../log/log.service';
import { MetricService } from '../metric/metric.service';
import { TraceService } from '../trace/trace.service';
import { HttpConfig } from './http.config';
import { HttpInjectionToken, HttpMethod } from './http.enum';
import { HttpCookie, HttpExceptionParams, HttpModuleOptions, HttpRequestParams, HttpRequestSendParams, HttpResponse, HttpTelemetryParams } from './http.interface';

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
    if (this.httpModuleOptions.silent) {
      this.logService = undefined;
      this.metricService = undefined;
      this.traceService = undefined;
    }

    this.setup();
  }

  /**
   * Creates new HTTP instance based on GOT.
   */
  public setup(): void {
    const { name, prefixUrl } = this.httpModuleOptions;
    this.logService?.debug(`Creating HTTP instance for ${name || prefixUrl}`);
    this.instance = got.extend(this.httpModuleOptions);
  }

  /**
   * Returns the underlying GOT client.
   */
  public getInstance(): Got {
    return this.instance;
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
   * register latency at outbound histogram.
   * @param url
   * @param params
   */
  // eslint-disable-next-line complexity
  public async request<T>(url: string, params: HttpRequestParams): Promise<T> {
    const { ignoreExceptions, resolveBodyOnly, method, replacements, query, body, headers } = params;
    const { retryLimit, retryCodes, retryDelay } = params;
    const { host, path } = this.getHostPath(url, params);
    const start = Date.now();
    let response: any;

    const sendParams: HttpRequestSendParams = {
      url: this.buildRequestUrl(url, params),
      request: this.buildRequestParams(params),
      telemetry: { start, method, host, path, replacements, query, body, headers },
      ignoreExceptions: ignoreExceptions ?? this.httpModuleOptions.ignoreExceptions,
      resolveBodyOnly: resolveBodyOnly ?? this.httpModuleOptions.resolveBodyOnly,
    };

    const rLimit = retryLimit ?? this.httpModuleOptions.retryLimit ?? this.httpConfig.HTTP_DEFAULT_RETRY_LIMIT;
    const rMethods = this.httpModuleOptions.retryMethods ?? this.httpConfig.HTTP_DEFAULT_RETRY_METHODS;
    const rCodes = retryCodes ?? this.httpModuleOptions.retryCodes ?? this.httpConfig.HTTP_DEFAULT_RETRY_CODES;
    const rDelay = retryDelay ?? this.httpModuleOptions.retryDelay ?? this.httpConfig.HTTP_DEFAULT_RETRY_DELAY;

    // If `retryLimit` is provided at request params, it takes precedence over `retryMethods`
    const isRetryable = !!retryLimit || retryLimit === 0 || rMethods.includes(method as HttpMethod);
    let attemptsLeft = isRetryable ? rLimit + 1 : 1;
    let attempts = 0;

    while (!response && attemptsLeft > 0) {
      try {
        response = await this.sendRequest(sendParams);
      }
      catch (e) {
        const exceptionCode = e.response?.outboundResponse?.code;
        const isRetryableCode = !exceptionCode || rCodes.includes(exceptionCode as HttpStatus);

        attemptsLeft--;
        attempts++;

        if (!attemptsLeft || !isRetryableCode) {
          throw e;
        }

        const delay = rDelay(attempts);

        const msg = `⯆ ${e.message} | Retry #${attempts}/${rLimit}, next in ${delay / 1000}s`;
        this.logService?.debug(msg, e as Error);

        await new Promise((r) => setTimeout(r, delay));
      }
    }

    if (response) {
      const headers: IncomingHttpHeaders = response.headers;
      response.cookies = this.parseCookies(headers);
    }

    return sendParams.resolveBodyOnly
      ? response?.body
      : response;
  }

  /**
   * Acquire pre replacement host and path given request params.
   * @param url
   * @param params
   */
  private getHostPath(url: string, params: HttpRequestParams): { host: string; path: string} {
    const { prefixUrl } = params;

    const rawHost: string = this.httpModuleOptions.prefixUrl as string || prefixUrl as string || url;
    const host = rawHost?.replace(/^https?:\/\//, '').split('/')[0];

    const rawPath = url.includes('http') ? url.replace(/^https?:\/\//, '').replace(host, '') : `/${url}`;
    const path = rawPath || '/';

    return { host, path };
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
        const replacement = replacements[key];

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
   * @param params
   */
  private buildLogMessage(params: HttpTelemetryParams): string {
    const { method, host, path, response } = params;

    return response
      ? `⯆ ${method} ${host}${path === '/' ? '' : path}`
      : `⯅ ${method} ${host}${path === '/' ? '' : path}`;
  }

  /**
   * Executes a request ensuring log and metrics collection.
   * @param params
   */
  private async sendRequest<T>(params: HttpRequestSendParams): Promise<HttpResponse<T>> {
    const { url, request, telemetry, ignoreExceptions } = params;
    const { method, host, path, replacements, query, body, headers } = telemetry;
    const logMessage = this.buildLogMessage(telemetry);
    let response: HttpResponse<T>;

    const span = this.traceService?.startChildSpan(logMessage, {
      attributes: {
        [SemanticAttributes.HTTP_METHOD]: method,
        [SemanticAttributes.HTTP_HOST]: host,
        [SemanticAttributes.HTTP_ROUTE]: path,
      },
    });

    try {
      this.logService?.http(logMessage, { method, host, path, replacements, query, body, headers });
      response = await this.instance(url, request) as HttpResponse<T>;

      this.registerOutboundTelemetry({ ...telemetry, response, span });
    }
    catch (e) {
      const isTimeout = /timeout/i.test(e.message as string);

      if (!isTimeout && !e.response) {
        span?.end();
        throw e;
      }

      const errorResponse = e.response || { statusCode: HttpStatus.GATEWAY_TIMEOUT };
      this.registerOutboundTelemetry({ ...telemetry, response: errorResponse });

      if (ignoreExceptions) {
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
   * @param params
   */
  private registerOutboundTelemetry(params: HttpTelemetryParams): void {
    const { start, method, host, path, response, span } = params;
    const { statusCode, body, headers } = response;

    const latency = Date.now() - start;
    const code = statusCode?.toString?.() || '';

    const logData = { latency, code, body: body || undefined, headers };
    this.logService?.http(this.buildLogMessage(params), logData);

    const histogram = this.metricService?.getHistogram(AppMetric.HTTP_OUTBOUND_LATENCY);

    if (histogram) {
      histogram.labels(method, host, path, code).observe(latency);
    }

    if (span) {
      span.setAttributes({
        [SemanticAttributes.HTTP_STATUS_CODE]: code,
        'http.latency': latency,
      });

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

    const code = isProxyExceptions && response?.statusCode
      ? Number(response?.statusCode)
      : HttpStatus.INTERNAL_SERVER_ERROR;

    delete request.url;

    throw new HttpException({
      message: `⯅ ${method} ${host}${path} | ${message}`,
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
