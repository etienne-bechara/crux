import { HttpException, HttpStatus, Inject, Injectable, InternalServerErrorException, Scope } from '@nestjs/common';
import got, { Got } from 'got';
import { IncomingHttpHeaders } from 'http';

import { LoggerService } from '../logger/logger.service';
import { HttpInjectionToken } from './http.enum';
import { HttpCookie, HttpExceptionParams, HttpModuleOptions, HttpRequestParams } from './http.interface';

@Injectable({ scope: Scope.TRANSIENT })
export class HttpService {

  private instance: Got;

  public constructor(
    @Inject(HttpInjectionToken.MODULE_OPTIONS)
    private readonly httpModuleOptions: HttpModuleOptions = { },
    private readonly loggerService: LoggerService,
  ) {
    if (this.httpModuleOptions.silent) {
      this.loggerService = undefined;
    }

    this.setup();
  }

  /**
   * Creates new HTTP instance based on GOT.
   */
  public setup(): void {
    const { name, prefixUrl } = this.httpModuleOptions;
    this.loggerService?.debug(`Creating instance for ${name || prefixUrl}`);
    this.instance = got.extend(this.httpModuleOptions);
  }

  /**
   * Returns the underlying GOT client.
   */
  public getInstance(): Got {
    return this.instance;
  }

  /**
   * Given a request configuration, replace URL variables that matches
   * :param_name to its equivalent at replacements property.
   * @param url
   * @param params
   */
  private replacePathVariables(url: string, params: HttpRequestParams): string {
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
   * If a query property is provided, overwrite the search params
   * with a functionality of allowing array inside object values.
   * @param params
   */
  private buildSearchParams(params: HttpRequestParams): void {
    const { query } = params;

    const mergedQuery = { ...this.httpModuleOptions.query, ...query };
    if (Object.keys(mergedQuery).length === 0) return;

    const queryParams = { };

    for (const key in mergedQuery) {
      if (Array.isArray(mergedQuery[key])) {
        queryParams[key] = mergedQuery[key].join(',');
      }
      else {
        queryParams[key] = mergedQuery[key];
      }
    }

    params.searchParams = queryParams;
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
   * Handles all requests, extending GOT functionality with:
   * - Path variables replacement
   * - Search param array joining
   * - Improved exception logging containing response
   * - Response exception proxying to client.
   * - Response cookie parsing.
   * @param url
   * @param params
   */
  public async request<T>(url: string, params: HttpRequestParams): Promise<T> {
    this.loggerService?.debug('Executing external request', { url, ...params });
    let res: any;

    const isIgnoreExceptions = params.ignoreExceptions ?? this.httpModuleOptions.ignoreExceptions;
    const isResolveBodyOnly = params.resolveBodyOnly ?? this.httpModuleOptions.resolveBodyOnly;
    params.resolveBodyOnly = undefined;

    const finalUrl = this.replacePathVariables(url, params);
    this.buildSearchParams(params);

    try {
      res = await this.instance(finalUrl, params);
    }
    catch (e) {
      if (isIgnoreExceptions) {
        res = e.response;
      }
      else {
        this.handleRequestException({ url, error: e, request: params });
      }
    }

    if (res) {
      const headers: IncomingHttpHeaders = res.headers;
      res.cookies = this.parseCookies(headers);
    }

    return isResolveBodyOnly ? res?.body : res;
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
    const { proxyExceptions } = this.httpModuleOptions;
    const { url, request, error } = params;
    const { message, response } = error;
    const { method } = request;

    const errorMessage: string = message;
    const exceptionCode = /code (\d+)/g.exec(errorMessage);

    const code = proxyExceptions && exceptionCode
      ? Number(exceptionCode[1])
      : HttpStatus.INTERNAL_SERVER_ERROR;

    delete request.url;

    throw new HttpException({
      message: `${method} ${url} | ${message}`,
      proxyExceptions,
      outboundResponse: {
        code: response?.statusCode,
        headers: response?.headers,
        body: response?.body,
      },
      outboundRequest: {
        url,
        method,
        ...request,
      },
    }, code);
  }

  /**
   * Send a GET request.
   * @param url
   * @param params
   */
  public async get<T>(url: string, params: HttpRequestParams = { }): Promise<T> {
    return this.request<T>(url, { ...params, method: 'GET' });
  }

  /**
   * Send a HEAD request.
   * @param url
   * @param params
   */
  public async head<T>(url: string, params: HttpRequestParams = { }): Promise<T> {
    return this.request<T>(url, { ...params, method: 'HEAD' });
  }

  /**
   * Send a POST request.
   * @param url
   * @param params
   */
  public async post<T>(url: string, params: HttpRequestParams = { }): Promise<T> {
    return this.request<T>(url, { ...params, method: 'POST' });
  }

  /**
   * Send a PUT request.
   * @param url
   * @param params
   */
  public async put<T>(url: string, params: HttpRequestParams = { }): Promise<T> {
    return this.request<T>(url, { ...params, method: 'PUT' });
  }

  /**
   * Send a DELETE request.
   * @param url
   * @param params
   */
  public async delete<T>(url: string, params: HttpRequestParams = { }): Promise<T> {
    return this.request<T>(url, { ...params, method: 'DELETE' });
  }

  /**
   * Send an OPTIONS request.
   * @param url
   * @param params
   */
  public async options<T>(url: string, params: HttpRequestParams = { }): Promise<T> {
    return this.request<T>(url, { ...params, method: 'OPTIONS' });
  }

  /**
   * Send a PATCH request.
   * @param url
   * @param params
   */
  public async patch<T>(url: string, params: HttpRequestParams = { }): Promise<T> {
    return this.request<T>(url, { ...params, method: 'PATCH' });
  }

}
