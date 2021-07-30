import { HttpException, HttpStatus, Inject, Injectable, InternalServerErrorException, Scope } from '@nestjs/common';
import got, { Got } from 'got';
import { IncomingHttpHeaders } from 'http';

import { LoggerService } from '../logger/logger.service';
import { HttpInjectionToken } from './http.enum';
import { HttpCookie, HttpExceptionHandlerParams, HttpModuleOptions, HttpRequestParams } from './http.interface';

@Injectable({ scope: Scope.TRANSIENT })
export class HttpService {

  private moduleOptions: HttpModuleOptions;
  protected instance: Got;

  public constructor(
    @Inject(HttpInjectionToken.MODULE_OPTIONS)
    protected readonly httpModuleOptions: HttpModuleOptions = { },
    protected readonly loggerService: LoggerService,
  ) {
    if (this.httpModuleOptions.silent) {
      this.loggerService = undefined;
    }

    this.moduleOptions = httpModuleOptions;
    this.setup();
  }

  /**
   * Creates new HTTP instance based on GOT.
   */
  public setup(): void {
    const { name, prefixUrl } = this.moduleOptions;
    this.loggerService?.debug(`[HttpService] Creating instance for ${name || prefixUrl}...`);
    this.instance = got.extend(this.moduleOptions);
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
  protected replacePathVariables(url: string, params: HttpRequestParams): string {
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
   * Given http response headers, acquire its parsed cookies.
   * @param headers
   */
  public parseCookies(headers: IncomingHttpHeaders): HttpCookie[] {
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
   * - Improved exception logging containing response
   * - Response exception proxying to client.
   * @param url
   * @param params
   */
  private async request<T>(url: string, params: HttpRequestParams): Promise<T> {
    this.loggerService?.debug('[HttpService] Executing external request...', params);

    const finalUrl = this.replacePathVariables(url, params);
    const isBodyOnly = this.moduleOptions.resolveBodyOnly || params.resolveBodyOnly;
    let res: T;

    try {
      params.resolveBodyOnly = undefined;
      res = await this.instance(finalUrl, params) as any;
    }
    catch (error) {
      this.handleRequestException({ url, error, request: params });
    }

    return isBodyOnly ? res['body'] : res;
  }

  /**
   * Standardize the output in case of a request exception in the format:
   * {method} {url} | {error message}.
   *
   * If the proxy option has been set, throws a NestJS http
   * exception with matching code.
   * @param params
   */
  private handleRequestException(params: HttpExceptionHandlerParams): void {
    const { proxyException } = this.moduleOptions;
    const { url, request, error } = params;
    const { message, response } = error;
    const { method } = request;

    const exceptionCode = /code (\d+)/g.exec(message);

    const statusCode = proxyException && exceptionCode
      ? Number(exceptionCode[1])
      : HttpStatus.INTERNAL_SERVER_ERROR;

    throw new HttpException({
      message: `${method} ${url} | ${message}`,
      proxyException,
      externalResponse: {
        status: response?.statusCode,
        headers: response?.headers,
        body: response?.body,
      },
      externalRequest: {
        method,
        url,
        ...request,
      },
    }, statusCode);
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
