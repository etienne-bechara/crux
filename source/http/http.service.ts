import { HttpException, HttpStatus, Inject, Injectable, InternalServerErrorException, Scope } from '@nestjs/common';
import axios, { AxiosAdapter, AxiosInstance, AxiosRequestConfig, AxiosResponse } from 'axios';
import { setupCache } from 'axios-cache-adapter';
import { Agent } from 'http';
import https from 'https';
import qs from 'qs';

import { AppEnvironment } from '../app/app.enum';
import { LoggerService } from '../logger/logger.service';
import { HttpConfig } from './http.config';
import { HttpInjectionToken, HttpPredefinedHandler, HttpReturnType } from './http.enum';
import { HttpCookie, HttpExceptionHandler, HttpHandlerParams, HttpModuleOptions, HttpRequestParams, HttpServiceBases, HttpServiceDefaults } from './http.interface';

@Injectable({ scope: Scope.TRANSIENT })
export class HttpService {

  protected bases: HttpServiceBases = {};
  protected defaults: HttpServiceDefaults= {};
  protected instance: AxiosInstance;

  public constructor(
    @Inject(HttpInjectionToken.MODULE_OPTIONS)
    protected readonly httpModuleOptions: HttpModuleOptions,
    protected readonly httpConfig: HttpConfig,
    protected readonly loggerService: LoggerService,
  ) {
    if (!httpModuleOptions?.manual) {
      this.setup(httpModuleOptions);
    }
  }

  /**
   * Creates new HTTP instance based on Axios, validator is
   * set to always true since we are customizing the response
   * handler to standardize exception reporting.
   * @param params
   */
  public setup(params: HttpModuleOptions = {}): void {
    this.setDefaultParams(params);
    this.setBaseParams(params);

    this.loggerService.debug(`[HttpService] Creating instance for ${params.name || this.bases.url}...`);
    this.instance = axios.create({
      adapter: this.buildAdapter(params),
      httpsAgent: this.buildHttpAgent(params),
      timeout: this.defaults.timeout,
      validateStatus: () => true,
    });
  }

  /**
   * Given instance configuration and an optional handler with
   * priority over default, resolves which handler to use.
   * @param priorityHandler
   */
  private getExceptionHandler(priorityHandler?: HttpExceptionHandler): (params: HttpHandlerParams) => Promise<void> {
    const handler = priorityHandler
      || this.defaults.exceptionHandler
      || HttpPredefinedHandler.INTERNAL_SERVER_ERROR;

    if (typeof handler !== 'string') return handler;

    // eslint-disable-next-line @typescript-eslint/require-await
    return async (params): Promise<void> => {
      const req = params.upstreamRequest;
      const res = params.upstreamResponse;

      const status = handler === HttpPredefinedHandler.INTERNAL_SERVER_ERROR
        ? HttpStatus.INTERNAL_SERVER_ERROR
        : res?.status;

      const data = {
        message: `${req.method} ${req.url} ${params.errorMessage}`,
        proxyResponse: handler === HttpPredefinedHandler.PROXY_FULL_RESPONSE
          ? true
          : undefined,
        upstreamResponse: {
          status,
          data: res?.data,
        },
        upstreamRequest: {
          method: req.method,
          url: req.url,
          ...req,
        },
      };

      throw new HttpException(data, status);
    };
  }

  /**
   * Defines and stores instance defaults, if not available set them to:
   * • Return type to BODY_CONTENT (Axios response data)
   * • Timeout to global default configured at https.setting
   * • Validator to pass on status lower than 400 (< bad request).
   * @param params
   */
  private setDefaultParams(params: HttpModuleOptions): void {
    if (!params.defaults) params.defaults = {};
    const defaultTimeout = this.httpConfig.HTTPS_DEFAULT_TIMEOUT;

    this.defaults.returnType = params.defaults.returnType || HttpReturnType.BODY_CONTENT;
    this.defaults.timeout = params.defaults.timeout || defaultTimeout;

    this.defaults.validator = params.defaults.validator
      ? params.defaults.validator
      : (s): boolean => s < 400;

    this.defaults.exceptionHandler = this.getExceptionHandler(params.defaults.exceptionHandler);
  }

  /**
   * Store base URL, body and headers if configured at setup.
   * @param params
   */
  private setBaseParams(params: HttpModuleOptions): void {
    if (!params.bases) params.bases = {};
    this.bases.url = params.bases.url,
    this.bases.headers = params.bases.headers;
    this.bases.query = params.bases.query;
    this.bases.body = params.bases.body;
  }

  /**
   * Configures the https agent according to priority:
   * • If httpsAgent property is set, use it
   * • If ssl property is set, decode certificate and use it
   * • If ignoreHttpErrors, customize it with a simple rejectUnauthorized.
   * @param params
   */
  private buildHttpAgent(params: HttpModuleOptions): Agent {
    if (params.agent?.custom) {
      return params.agent.custom;
    }

    if (params.agent?.ssl) {
      return new https.Agent({
        cert: Buffer.from(params.agent.ssl.cert, 'base64').toString('ascii'),
        key: Buffer.from(params.agent.ssl.key, 'base64').toString('ascii'),
        passphrase: params.agent.ssl.passphrase,
        rejectUnauthorized: !params.agent.ignoreHttpErrors,
      });
    }

    if (params.agent?.ignoreHttpErrors) {
      return new https.Agent({
        rejectUnauthorized: false,
      });
    }
  }

  /**
   * Configures the request adapter which may have added cache properties.
   * Alter original default properties to add maximum limit as well as
   * remove query param restriction.
   * @param params
   */
  private buildAdapter(params: HttpModuleOptions): AxiosAdapter {
    if (!params.cache) return;

    if (params.cache.maxAge === undefined) {
      params.cache.maxAge = this.httpConfig.HTTPS_DEFAULT_CACHE_MAX_AGE;
    }

    if (params.cache.limit === undefined) {
      params.cache.limit = this.httpConfig.HTTPS_DEFAULT_CACHE_LIMIT;
    }

    if (!params.cache.exclude) {
      params.cache.exclude = { query: false };
    }

    if (!params.cache.invalidate && this.httpConfig.NODE_ENV === AppEnvironment.LOCAL) {
      // eslint-disable-next-line @typescript-eslint/require-await
      params.cache.invalidate = async (cacheConfig: any): Promise<void> => {
        if (Object.keys(cacheConfig?.store?.store).includes(cacheConfig.uuid)) {
          this.loggerService.debug(`[HttpService] Cache hit: ${cacheConfig.uuid}`);
        }
        else {
          this.loggerService.debug(`[HttpService] Cache miss: ${cacheConfig.uuid}`);
        }
      };
    }

    return setupCache(params.cache).adapter;
  }

  /**
   * Given configured params for an http request, join previously configured
   * base URL, headers, query and data, returning a clone.
   * In case of conflicts the defaults are overwritten.
   * @param params
   */
  private mergeBaseParams(params: HttpRequestParams): HttpRequestParams {
    const mergedParams = Object.assign({}, params);

    if (this.bases.url && !params.url?.startsWith('http')) {
      const resolvedUrl = typeof this.bases.url === 'string'
        ? this.bases.url
        : this.bases.url();
      mergedParams.url = `${resolvedUrl}${params.url}`;
    }

    if (this.bases.headers || params.headers) {
      mergedParams.headers = { ...this.bases.headers, ...params.headers };
    }

    if (this.bases.query || params.query) {
      mergedParams.query = { ...this.bases.query, ...params.query };
    }

    if (this.bases.body) {
      if (params.body) mergedParams.body = { ...this.bases.body, ...params.body };
      if (params.form) mergedParams.form = { ...this.bases.body, ...params.form };
      if (params.json) mergedParams.json = { ...this.bases.body, ...params.json };
    }

    return mergedParams;
  }

  /**
   * Apply the following request params replacements:
   * • URLs with :param_name to its equivalent at replacements property
   * • Request data as stringified form if property is present.
   * • Remove properties unrecognizable by Axios.
   * @param params
   */
  private replaceVariantParams(params: HttpRequestParams): HttpRequestParams {
    const replacedParams = Object.assign({}, params);

    if (params.replacements) {
      for (const key in params.replacements) {
        const replacement = params.replacements[key];

        if (!replacement || typeof replacement !== 'string' || replacement === '') {
          throw new InternalServerErrorException(`path parameter ${key} must be a defined string`);
        }

        const replaceRegex = new RegExp(`:${key}`, 'g');
        const value = encodeURIComponent(params.replacements[key].toString());
        replacedParams.url = replacedParams.url.replace(replaceRegex, value);
      }
    }

    if (params.form) {
      if (!replacedParams.headers) replacedParams.headers = {};
      replacedParams.headers['content-type'] = 'application/x-www-form-urlencoded';
      replacedParams.body = qs.stringify(params.form);
      delete replacedParams.form;
    }

    if (params.json) {
      if (!replacedParams.headers) replacedParams.headers = {};
      replacedParams.headers['content-type'] = 'application/json';
      replacedParams.body = params.json;
      delete replacedParams.json;
    }

    return replacedParams;
  }

  /**
   * Given a successful response, isolate its cookies in an
   * easily accessible array of interfaces.
   * @param res
   */
  private parseResponseCookies(res: any): any {
    const cookies: HttpCookie[] = [ ];

    if (!res?.headers || !res.headers['set-cookie']) {
      res.headers['set-cookie'] = [ ];
    }

    for (const cookie of res.headers['set-cookie']) {
      const name = /^(.+?)=/gi.exec(cookie);
      const content = /^.+?=(.+?)(?:$|;)/gi.exec(cookie);
      const path = /path=(.+?)(?:$|;)/gi.exec(cookie);
      const domain = /domain=(.+?)(?:$|;)/gi.exec(cookie);
      const expires = /expires=(.+?)(?:$|;)/gi.exec(cookie);
      if (!name || !content) continue;

      let utcExpiration;

      try {
        utcExpiration = new Date(expires[1]).toISOString();
      }
      catch {
        utcExpiration = null;
      }

      cookies.push({
        name: name[1],
        content: content[1],
        path: path ? path[1] : null,
        domain: domain ? domain[1] : null,
        expires: utcExpiration,
      });
    }

    res.cookies = cookies;
    return res;
  }

  /**
   * Handles all requests, extending default axios functionality with:
   * • Better validation: Include returned data in case of validation failure
   * • Better timeout: Based on server timing instead of only after DNS resolve
   * • Error standardization: Add several data for easier debugging.
   * @param params
   */
  public async request<T>(params: HttpRequestParams): Promise<T> {
    if (!this.instance) this.setup();
    const finalParams = this.replaceVariantParams(this.mergeBaseParams(params));

    const returnType = finalParams.returnType || this.defaults.returnType;
    const validator = finalParams.validateStatus || this.defaults.validator;
    const exceptionHandler = this.getExceptionHandler(finalParams.exceptionHandler);

    const timeout = finalParams.timeout || this.defaults.timeout;
    const cancelSource = axios.CancelToken.source();

    let errorMsg: string;
    let res: AxiosResponse | any;

    this.loggerService.debug('[HttpService] Executing external request...', finalParams);

    try {
      const axiosConfig: AxiosRequestConfig = {
        method: finalParams.method,
        url: finalParams.url,
        headers: finalParams.headers,
        params: finalParams.query,
        data: finalParams.body,
        cancelToken: cancelSource.token,
        ...finalParams.extras,
      };

      res = await Promise.race([
        this.instance(axiosConfig),
        new Promise((resolve) => setTimeout(resolve, timeout)),
      ]);

      if (!res) {
        cancelSource.cancel();
        errorMsg = `timed out after ${timeout / 1000}s`;
      }
      else if (!validator(res.status)) {
        errorMsg = `failed with status code ${res.status}`;
      }
    }
    catch (e) {
      errorMsg = e.message.includes('timeout')
        ? `timed out after ${timeout / 1000}s`
        : `failed due to ${e.message}`;
    }

    if (errorMsg) {
      await exceptionHandler({
        errorMessage: errorMsg,
        upstreamRequest: finalParams,
        upstreamResponse: res,
      });
    }

    return res && returnType === HttpReturnType.BODY_CONTENT
      ? res.data
      : this.parseResponseCookies(res);
  }

  /**
   * Send a GET request.
   * @param url
   * @param params
   */
  public async get<T>(url: string, params: HttpRequestParams = {}): Promise<T> {
    params.method = 'GET';
    params.url = url;
    return this.request<T>(params);
  }

  /**
   * Send a HEAD request.
   * @param url
   * @param params
   */
  public async head<T>(url: string, params: HttpRequestParams = {}): Promise<T> {
    params.method = 'HEAD';
    params.url = url;
    return this.request<T>(params);
  }

  /**
   * Send a POST request.
   * @param url
   * @param params
   */
  public async post<T>(url: string, params: HttpRequestParams = {}): Promise<T> {
    params.method = 'POST';
    params.url = url;
    return this.request<T>(params);
  }

  /**
   * Send a PUT request.
   * @param url
   * @param params
   */
  public async put<T>(url: string, params: HttpRequestParams = {}): Promise<T> {
    params.method = 'PUT';
    params.url = url;
    return this.request<T>(params);
  }

  /**
   * Send a DELETE request.
   * @param url
   * @param params
   */
  public async delete<T>(url: string, params: HttpRequestParams = {}): Promise<T> {
    params.method = 'DELETE';
    params.url = url;
    return this.request<T>(params);
  }

  /**
   * Send an OPTIONS request.
   * @param url
   * @param params
   */
  public async options<T>(url: string, params: HttpRequestParams = {}): Promise<T> {
    params.method = 'OPTIONS';
    params.url = url;
    return this.request<T>(params);
  }

  /**
   * Send a PATCH request.
   * @param url
   * @param params
   */
  public async patch<T>(url: string, params: HttpRequestParams = {}): Promise<T> {
    params.method = 'PATCH';
    params.url = url;
    return this.request<T>(params);
  }

}
