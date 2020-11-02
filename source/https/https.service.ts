import { Inject, Injectable, InternalServerErrorException, Scope } from '@nestjs/common';
import axios, { AxiosInstance, AxiosResponse } from 'axios';
import https from 'https';
import moment from 'moment';
import qs from 'qs';

import { HttpsConfig } from './https.config';
import { HttpsReturnType } from './https.enum';
import { HttpsCookie, HttpsModuleOptions, HttpsRequestParams, HttpsServiceBases,
  HttpsServiceDefaults } from './https.interface';

@Injectable({ scope: Scope.TRANSIENT })
export class HttpsService {

  private bases: HttpsServiceBases = { };
  private defaults: HttpsServiceDefaults= { };
  private httpsAgent: https.Agent;
  private instance: AxiosInstance;

  public constructor(
    @Inject(HttpsConfig.HTTPS_MODULE_OPTIONS_TOKEN)
    private readonly httpsModuleOptions: HttpsModuleOptions,
    private readonly httpsConfig: HttpsConfig,
  ) {
    this.setupInstance(httpsModuleOptions);
  }

  /**
   * Creates new HTTP instance based on Axios, validator is
   * set to always true since we are customizing the response
   * handler to standardize exception reporting.
   * @param params
   */
  private setupInstance(params: HttpsModuleOptions = { }): void {
    this.setDefaultParams(params);
    this.setBaseParams(params);
    this.setHttpsAgent(params);
    this.instance = axios.create({
      timeout: this.defaults.timeout,
      validateStatus: () => true,
      httpsAgent: this.httpsAgent,
    });
  }

  /**
   * Defines and stores instance defaults, if not available set them to:
   * • Return type to DATA (Axios response data)
   * • Timeout to global default configured at https.setting
   * • Validator to pass on status lower than 400 (< bad request).
   * @param params
   */
  private setDefaultParams(params: HttpsModuleOptions): void {
    if (!params.defaults) params.defaults = { };
    const defaultTimeout = this.httpsConfig.HTTPS_DEFAULT_TIMEOUT;

    this.defaults.returnType = params.defaults.returnType || HttpsReturnType.DATA;
    this.defaults.timeout = params.defaults.timeout || defaultTimeout;

    this.defaults.validator = params.defaults.validator
      ? params.defaults.validator
      : (s): boolean => s < 400;

    this.defaults.exceptionHandler = params.defaults.exceptionHandler
      ? params.defaults.exceptionHandler
      // eslint-disable-next-line @typescript-eslint/require-await
      : async (params, res, msg): Promise<void> => {
        throw new InternalServerErrorException({
          message: `${params.method} ${params.url} ${msg}`,
          upstream_request: params,
          upstream_response: {
            status: res ? res.status : undefined,
            headers: res ? res.headers : undefined,
            data: res ? res.data : undefined,
          },
        });
      };
  }

  /**
   * Store base URL, body and headers if configured at setup.
   * @param params
   */
  private setBaseParams(params: HttpsModuleOptions): void {
    if (!params.bases) params.bases = { };
    this.bases.url = params.bases.url,
    this.bases.headers = params.bases.headers || { };
    this.bases.query = params.bases.query;
    this.bases.body = params.bases.body;
  }

  /**
   * Configures the https agent according to priority:
   * • If httpsAgent property is set, use it
   * • If ssl property is set, decode certificate and use it
   * • If ignoreHttpsErrors, customize it with a simple rejectUnauthorized.
   * @param params
   */
  private setHttpsAgent(params: HttpsModuleOptions): void {
    if (!params.agent) {
      return;
    }
    else if (params.agent.custom) {
      this.httpsAgent = params.agent.custom;
    }
    else if (params.agent.ssl) {
      this.httpsAgent = new https.Agent({
        cert: Buffer.from(params.agent.ssl.cert, 'base64').toString('ascii'),
        key: Buffer.from(params.agent.ssl.key, 'base64').toString('ascii'),
        passphrase: params.agent.ssl.passphrase,
        rejectUnauthorized: !params.agent.ignoreHttpsErrors,
      });
    }
    else if (params.agent.ignoreHttpsErrors) {
      this.httpsAgent = new https.Agent({
        rejectUnauthorized: false,
      });
    }
  }

  /**
   * Given configured params for an http request, join previously configured
   * base URL, headers, query and data, returning a clone.
   * In case of conflicts the defaults are overwritten.
   * @param params
   */
  private mergeBaseParams(params: HttpsRequestParams): HttpsRequestParams {
    const mergedParams = Object.assign({ }, params);

    if (this.bases.url) {
      mergedParams.url = `${this.bases.url}${params.url}`;
    }

    if (this.bases.headers || params.headers) {
      if (!params.headers) params.headers = { };
      mergedParams.headers = { ...this.bases.headers, ...params.headers };
    }

    if (this.bases.query) {
      mergedParams.params = { ...this.bases.query, ...params.params };
    }

    if (this.bases.body) {
      if (params.data) mergedParams.data = { ...this.bases.body, ...params.data };
      if (params.form) mergedParams.form = { ...this.bases.body, ...params.form };
      if (params.json) mergedParams.json = { ...this.bases.body, ...params.json };
    }

    return mergedParams;
  }

  /**
   * Apply the following request params replacements:
   * • URLs with :param_name to its equivalent at replacements property
   * • Request data as stringified form if property is present.
   * @param params
   */
  private replaceVariantParams(params: HttpsRequestParams): HttpsRequestParams {
    const replacedParams = Object.assign({ }, params);

    if (params.replacements) {
      for (const key in params.replacements) {
        const replaceRegex = new RegExp(`:${key}`, 'g');
        const value = encodeURIComponent(params.replacements[key].toString());
        replacedParams.url = replacedParams.url.replace(replaceRegex, value);
      }
    }

    if (params.form) {
      replacedParams.headers['content-type'] = 'application/x-www-form-urlencoded';
      replacedParams.data = qs.stringify(params.form);
    }

    if (params.json) {
      replacedParams.headers['content-type'] = 'application/json';
      replacedParams.data = params.json;
    }

    return replacedParams;
  }

  /**
   * Given a successful response, isolate its cookies in an
   * easily accessible array of interfaces.
   * @param res
   */
  private parseResponseCookies(res: any): any {
    const cookies: HttpsCookie[] = [ ];

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

      cookies.push({
        name: name[1],
        content: content[1],
        path: path ? path[1] : null,
        domain: domain ? domain[1] : null,
        expires: expires
          ? moment.utc(expires[1], 'ddd, DD-MMM-YYYY HH:mm:ss').toISOString()
          : null,
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
  public async request<T>(params: HttpsRequestParams): Promise<T> {
    if (!this.instance) this.setupInstance();

    const finalParams = this.replaceVariantParams(this.mergeBaseParams(params));
    const returnType = finalParams.returnType || this.defaults.returnType;
    const validator = finalParams.validateStatus || this.defaults.validator;
    const exceptionHandler = finalParams.exceptionHandler || this.defaults.exceptionHandler;
    const timeout = finalParams.timeout || this.defaults.timeout;
    const cancelSource = axios.CancelToken.source();

    let errorMsg: string;
    let res: AxiosResponse | void;
    finalParams.cancelToken = cancelSource.token;

    try {
      res = await Promise.race([
        this.instance(finalParams),
        new Promise((resolve) => setTimeout(resolve, timeout)) as any,
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

    if (errorMsg) await exceptionHandler(params, res, errorMsg);

    return res && returnType === HttpsReturnType.DATA
      ? res.data
      : this.parseResponseCookies(res);
  }

  /**
   * GET.
   * @param url
   * @param params
   */
  public async get<T>(url: string, params: HttpsRequestParams = { }): Promise<T> {
    params.method = 'GET';
    params.url = url;
    return this.request<T>(params);
  }

  /**
   * POST.
   * @param url
   * @param params
   */
  public async post<T>(url: string, params: HttpsRequestParams = { }): Promise<T> {
    params.method = 'POST';
    params.url = url;
    return this.request<T>(params);
  }

  /**
   * PUT.
   * @param url
   * @param params
   */
  public async put<T>(url: string, params: HttpsRequestParams = { }): Promise<T> {
    params.method = 'PUT';
    params.url = url;
    return this.request<T>(params);
  }

  /**
   * DELETE.
   * @param url
   * @param params
   */
  public async delete<T>(url: string, params: HttpsRequestParams = { }): Promise<T> {
    params.method = 'DELETE';
    params.url = url;
    return this.request<T>(params);
  }

}
