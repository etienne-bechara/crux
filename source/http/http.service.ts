import { forwardRef, HttpException, HttpStatus, Inject, Injectable, InternalServerErrorException, Scope } from '@nestjs/common';
import { propagation, SpanOptions, SpanStatusCode } from '@opentelemetry/api';
import { SemanticAttributes } from '@opentelemetry/semantic-conventions';

import { AppConfig } from '../app/app.config';
import { AppTraffic } from '../app/app.enum';
import { CacheStatus } from '../cache/cache.enum';
import { CacheService } from '../cache/cache.service';
import { ContextStorageKey } from '../context/context.enum';
import { ContextStorage } from '../context/context.storage';
import { LogService } from '../log/log.service';
import { MetricService } from '../metric/metric.service';
import { PromiseService } from '../promise/promise.service';
import { TraceService } from '../trace/trace.service';
import { HttpInjectionToken, HttpMethod, HttpParser } from './http.enum';
import { HttpCacheParams, HttpCookie, HttpModuleOptions, HttpOptions, HttpRequestFlowParams, HttpRequestParams, HttpResponse, HttpRetryParams, HttpTelemetryParams } from './http.interface';

@Injectable({ scope: Scope.TRANSIENT })
export class HttpService {

  private defaultOptions: HttpOptions;

  public constructor(
    @Inject(HttpInjectionToken.HTTP_MODULE_OPTIONS)
    private readonly httpModuleOptions: HttpModuleOptions = { },
    private readonly appConfig: AppConfig,
    private readonly promiseService: PromiseService,
    private readonly logService?: LogService,
    @Inject(forwardRef(() => MetricService))
    private readonly metricService?: MetricService,
    @Inject(forwardRef(() => TraceService))
    private readonly traceService?: TraceService,
    @Inject(forwardRef(() => CacheService))
    private readonly cacheService?: CacheService,
  ) {
    if (this.httpModuleOptions.disableTelemetry) {
      this.logService = undefined;
      this.metricService = undefined;
      this.traceService = undefined;
    }

    this.defaultOptions = this.appConfig.APP_OPTIONS.http || { };
  }

  /**
   * Replace url placeholder in the format :param_name
   * which its equivalent target value.
   * @param url
   * @param replacements
   */
  private replaceUrlPlaceholders(url: string, replacements: Record<string, string | number>): string {
    let replacedUrl = url;

    if (replacements) {
      for (const key in replacements) {
        const replacement = replacements[key]?.toString?.();

        if (!replacement || typeof replacement !== 'string') {
          throw new InternalServerErrorException(`path replacement ${key} must be a defined string`);
        }

        const replaceRegex = new RegExp(`:${key}`, 'g');
        replacedUrl = replacedUrl.replace(replaceRegex, replacement);
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
    const { query, json, form } = params;

    params.method ??= HttpMethod.GET;

    if (query || this.httpModuleOptions.query) {
      params.query = { ...this.httpModuleOptions.query, ...query };
    }

    if (json && !Array.isArray(json)) {
      params.json = { ...this.httpModuleOptions.json, ...json };
    }

    if (form) {
      params.form = { ...this.httpModuleOptions.form, ...form };
    }

    return params;
  }

  /**
   * Build all necessary variables for telemetry.
   * @param url
   * @param params
   */
  private buildTelemetryParams(url: string, params: HttpRequestParams): HttpTelemetryParams {
    const { method, replacements, query, body: rawBody, json, form, headers } = params;

    const finalPrefix = this.httpModuleOptions.url;
    const finalUrl = url.startsWith('http') ? new URL(url) : new URL(`${finalPrefix}/${url}`);

    const { host, pathname: path } = finalUrl;
    const body = rawBody || json || form;

    const spanOptions: SpanOptions = {
      attributes: {
        [SemanticAttributes.HTTP_METHOD]: method,
        [SemanticAttributes.HTTP_HOST]: host,
        [SemanticAttributes.HTTP_ROUTE]: path,
      },
    };

    return { method, host, path, replacements, query, body, headers, spanOptions };
  }

  /**
   * Merge request retry options with module level and calculate
   * maximum limit as well as return allowed codes and delay.
   * @param params
   */
  private buildRetryParams(params: HttpRequestParams): HttpRetryParams {
    const { method: paramsMethod, retryLimit: paramsLimit, retryCodes: paramsCodes, retryDelay: paramsDelay } = params;
    const { retryLimit: moduleLimit, retryCodes: moduleCodes } = this.httpModuleOptions;
    const { retryMethods: moduleMethods, retryDelay: moduleDelay } = this.httpModuleOptions;
    const { retryLimit: defaultLimit, retryCodes: defaultCodes } = this.defaultOptions;
    const { retryMethods: defaultMethods, retryDelay: defaultDelay } = this.defaultOptions;

    const retryLimitBase = paramsLimit ?? moduleLimit ?? defaultLimit;
    const retryMethods = moduleMethods ?? defaultMethods;
    const retryCodes = paramsCodes ?? moduleCodes ?? defaultCodes;
    const retryDelay = paramsDelay ?? moduleDelay ?? defaultDelay;

    const method: HttpMethod = paramsMethod as any || HttpMethod.GET;
    const isRetryable = !!paramsLimit || paramsLimit === 0 || retryMethods.includes(method);
    const retryLimit = isRetryable ? retryLimitBase + 1 : 1;

    return { retryLimit, retryCodes, retryDelay, attempt: 0 };
  }

  /**
   * Merge cache options with module level.
   * @param params
   */
  private buildCacheParams(params: HttpRequestParams): HttpCacheParams {
    const { method: paramsMethod, cacheTtl: paramsTtl, cacheTimeout: paramsTimeout } = params;
    const { cacheTtl: moduleTtl, cacheTimeout: moduleTimeout, cacheMethods: moduleMethods } = this.httpModuleOptions;
    const { cacheTtl: defaultTtl, cacheTimeout: defaultTimeout, cacheMethods: defaultMethods } = this.defaultOptions;

    const cacheTtlBase = paramsTtl ?? moduleTtl ?? defaultTtl;
    const cacheTimeout = paramsTimeout ?? moduleTimeout ?? defaultTimeout;
    const cacheMethods = moduleMethods ?? defaultMethods;

    const method: HttpMethod = paramsMethod as any || HttpMethod.GET;
    const isCacheable = cacheTtlBase > 0 && cacheMethods.includes(method);
    const cacheTtl = isCacheable ? cacheTtlBase : 0;

    return { cacheTtl, cacheTimeout, cacheMethods };
  }

  /**
   * Build all manipulated parameters including retry and telemetry data
   * to start a request flow.
   * @param url
   * @param params
   */
  private buildRequestSendParams(url: string, params: HttpRequestParams): HttpRequestFlowParams {
    const { ignoreExceptions, parser, replacements } = params;

    return {
      url: this.replaceUrlPlaceholders(url, replacements),
      request: this.buildRequestParams(params),
      ignoreExceptions: ignoreExceptions ?? this.httpModuleOptions.ignoreExceptions,
      parser: parser ?? this.httpModuleOptions.parser,
      telemetry: this.buildTelemetryParams(url, params),
      retry: this.buildRetryParams(params),
      cache: this.buildCacheParams(params),
    };
  }

  /**
   * Sends an HTTP request including:
   * - Path variables replacement and search param array joining
   * - Full observability with logs, metrics and tracing
   * - Configurable retry conditions and outbound caching
   * - Response exception proxying and cookie parsing.
   * @param url
   * @param params
   */
  public async request<T>(url: string, params: HttpRequestParams): Promise<T> {
    const sendParams = this.buildRequestSendParams(url, params);
    const response = await this.sendRequestLoopHandler(sendParams);

    switch (sendParams.parser) {
      case HttpParser.BUFFER: {
        return response.arrayBuffer() as T;
      }

      case HttpParser.JSON: {
        return response.json() as T;
      }

      case HttpParser.TEXT: {
        return response.text() as T;
      }

      default: {
        return response as T;
      }
    }
  }

  /**
   * Orchestrates HTTP request sending retry loop, upon succeeding
   * parses response cookies and returns acquired data.
   * @param params
   */
  private async sendRequestLoopHandler(params: HttpRequestFlowParams): Promise<HttpResponse> {
    let response: HttpResponse;

    while (!response) {
      response = await this.sendRequestRetryHandler(params);
    }

    if (response) {
      response.cookies = this.parseCookies(response.headers);
    }

    return response;
  }

  /**
   * Orchestrates HTTP request retry exception handler, upon failure
   * check if there are attempts left, in which case do not throw
   * the loop handler may try again.
   * @param params
   */
  private async sendRequestRetryHandler(params: HttpRequestFlowParams): Promise<HttpResponse> {
    const contextTimeoutMsg = 'context request timed out';
    const { retry } = params;
    const { retryLimit, retryCodes, retryDelay } = retry;
    let response: HttpResponse;

    retry.attempt++;

    const { attempt } = retry;

    try {
      const isTimedOut = ContextStorage.getStore()?.get(ContextStorageKey.REQUEST_TIMED_OUT);
      if (isTimedOut) throw new Error(contextTimeoutMsg);

      response = await this.sendRequestSpanHandler(params);
    }
    catch (e) {
      const attemptResponse = e.response?.outboundResponse;
      const isRetryableCode = !attemptResponse?.code || retryCodes.includes(attemptResponse?.code as HttpStatus);
      const attemptsLeft = retryLimit - attempt;

      if (!attemptsLeft || !isRetryableCode || e.message === contextTimeoutMsg) {
        throw e;
      }

      const delay = retryDelay(attempt);
      this.logService?.warning({ attempt, retryLimit, retryDelay: delay }, e as Error);

      await this.promiseService.sleep(delay);
    }

    return response;
  }

  /**
   * Orchestrates HTTP request sending within tracing span,
   * builds its name based on parameters.
   * @param params
   */
  private async sendRequestSpanHandler(params: HttpRequestFlowParams): Promise<HttpResponse> {
    const { telemetry, retry } = params;
    const { method, host, path, spanOptions } = telemetry;
    const { retryLimit, attempt } = retry;

    const spanName = `Http | ⯅ ${method} ${host}${path} | #${attempt}/${retryLimit}`;

    return this.traceService
      ? await this.traceService.startActiveSpan(spanName, spanOptions, async (span) => {
        return this.sendRequestClientHandler({ ...params, span });
      })
      : await this.sendRequestClientHandler(params);
  }

  /**
   * Orchestrates HTTP request sending with Node.js fetch, which
   * also includes adding propagation headers. Upon failure calls
   * the client exception handler.
   * @param params
   */
  private async sendRequestClientHandler(params: HttpRequestFlowParams): Promise<HttpResponse> {
    params.telemetry.start = Date.now();

    this.injectPropagationHeaders(params);
    this.logHttpMessage(params);

    try {
      params.response = await this.sendRequestCacheHandler(params);
    }
    catch (e) {
      const isTimeout = /timeout/i.test(e.message as string);

      params.response = e.response || { statusCode: HttpStatus.GATEWAY_TIMEOUT };
      params.error = e;

      if (!isTimeout && !e.response) {
        throw e;
      }
      else if (!params.ignoreExceptions) {
        this.handleRequestException(params);
      }
    }
    finally {
      this.collectOutboundTelemetry(params);
    }

    return params.response as HttpResponse;
  }

  /**
   * Orchestrates HTTP request sending with distributed cache support.
   * @param params
   */
  private async sendRequestCacheHandler(params: HttpRequestFlowParams): Promise<HttpResponse> {
    const { url, request, telemetry, cache } = params;
    const { host, method, path: rawPath, query } = telemetry;
    const { cacheTtl: ttl, cacheTimeout: timeout } = cache;
    // TODO: query, json, form, timeout
    const { replacements, headers } = request;
    let response: HttpResponse;

    const traffic = AppTraffic.OUTBOUND;
    const path = this.replaceUrlPlaceholders(rawPath, replacements);
    const cacheParams = { traffic, host, method, path, query, timeout };
    telemetry.cacheStatus = CacheStatus.DISABLED;

    if (ttl) {
      try {
        response = await this.cacheService.getCache(cacheParams);
      }
      catch (e) {
        this.logService.warning('Failed to acquire outbound cached data', e as Error);
      }

      if (response) {
        this.logService.debug('Resolving outbound request with cached data');
        telemetry.cacheStatus = CacheStatus.HIT;
        return response;
      }
    }

    response = await fetch(url, { method, headers });

    if (ttl) {
      telemetry.cacheStatus = CacheStatus.MISS;
      const { status, headers, body } = response;
      const data = { status, headers, body };

      this.cacheService.setCache(data, { ...cacheParams, ttl });
    }

    return response;
  }

  /**
   * Adds tracing propagation headers to HTTP request.
   * @param params
   */
  private injectPropagationHeaders(params: HttpRequestFlowParams): void {
    const { request, span } = params;

    if (span && !this.httpModuleOptions.disablePropagation) {
      request.headers ??= { };
      const ctx = this.traceService.getContextBySpan(span);
      propagation.inject(ctx, request.headers);
    }
  }

  /**
   * Create log record of outbound http request.
   * @param params
   */
  private logHttpMessage(params: HttpRequestFlowParams): void {
    const { telemetry } = params;
    const { method, host, path, replacements, query, body: reqBody, headers } = telemetry;
    const body = this.appConfig.APP_OPTIONS.logs?.enableRequestBody ? reqBody : undefined;

    this.logService?.http(`⯅ ${method} ${host}${path}`, { method, host, path, replacements, query, body, headers });
  }

  /**
   * Given http response headers, acquire its parsed cookies.
   * @param headers
   */
  private parseCookies(headers: Headers): HttpCookie[] {
    const setCookie: string[] = headers?.['set-cookie'];
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
  private collectOutboundTelemetry(params: HttpRequestFlowParams): void {
    const { telemetry, span, response, error } = params;
    const { start, method, host, path, cacheStatus: cache } = telemetry;
    const { status: code, body: resBody, headers } = response || { };
    const duration = (Date.now() - start) / 1000;

    const traffic = AppTraffic.OUTBOUND;
    const body = this.appConfig.APP_OPTIONS.logs?.enableResponseBody ? resBody || undefined : undefined;

    this.logService?.http(`⯆ ${method} ${host}${path}`, { duration, code, body, headers });
    this.metricService?.observeHttpDuration({ traffic, method, host, path, code, cache, duration });

    if (span) {
      span.setAttributes({
        [SemanticAttributes.HTTP_STATUS_CODE]: String(code) || undefined,
        'http.duration': duration, // eslint-disable-line @typescript-eslint/naming-convention
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
  private handleRequestException(params: HttpRequestFlowParams): void {
    const { telemetry, request, response, error } = params;
    const { method, host, path } = telemetry;
    const { message } = error;
    const { proxyExceptions, body } = request;
    const isProxyExceptions = proxyExceptions ?? this.httpModuleOptions.proxyExceptions;

    const code: HttpStatus = isProxyExceptions && response?.status
      ? response?.status
      : HttpStatus.INTERNAL_SERVER_ERROR;

    throw new HttpException({
      message: `⯆ ${method} ${host}${path} | ${message}`,
      proxyExceptions: isProxyExceptions,
      outboundRequest: {
        method,
        host,
        path,
        ...request,
        body,
        url: undefined,
      },
      outboundResponse: {
        code: response?.status,
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
