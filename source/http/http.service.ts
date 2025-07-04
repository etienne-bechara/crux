import { setTimeout } from 'node:timers/promises';
import {
	HttpException,
	HttpStatus,
	Inject,
	Injectable,
	InternalServerErrorException,
	Scope,
	forwardRef,
} from '@nestjs/common';
import { Context, SpanOptions, SpanStatusCode, propagation } from '@opentelemetry/api';
import qs from 'query-string';

import { Span } from '@opentelemetry/sdk-trace-base';
import { AppConfig } from '../app/app.config';
import { AppTraffic } from '../app/app.enum';
import { CacheStatus } from '../cache/cache.enum';
import { CacheService } from '../cache/cache.service';
import { ContextStorageKey } from '../context/context.enum';
import { ContextStorage } from '../context/context.storage';
import { LogService } from '../log/log.service';
import { MetricService } from '../metric/metric.service';
import { TraceService } from '../trace/trace.service';
import { HttpInjectionToken, HttpMethod, HttpTimeoutMessage } from './http.enum';
import { HttpFetchError } from './http.error';
import {
	HttpCacheSendParams,
	HttpCookie,
	HttpError,
	HttpErrorResponse,
	HttpModuleOptions,
	HttpOptions,
	HttpRequestOptions,
	HttpRequestSendParams,
	HttpResponse,
	HttpRetrySendParams,
	HttpSendParams,
	HttpTelemetrySendParams,
} from './http.interface';

@Injectable({ scope: Scope.TRANSIENT })
export class HttpService {
	private defaultOptions: HttpOptions;

	public constructor(
		// biome-ignore lint/style/useDefaultParameterLast: <explanation>
		@Inject(HttpInjectionToken.HTTP_MODULE_OPTIONS)
		private readonly httpModuleOptions: HttpModuleOptions = {},
		private readonly appConfig: AppConfig,
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

		this.defaultOptions = this.appConfig.APP_OPTIONS.http;
	}

	/**
	 * Replace url placeholder in the format :param_name
	 * which its equivalent target value.
	 * @param url
	 * @param replacements
	 */
	private replaceUrlPlaceholders(url: string, replacements?: Record<string, string | number>): string {
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
	 * Merge request params with those defined at module level.
	 * @param url
	 * @param params
	 */
	private buildRequestParams(url: string, params: HttpRequestOptions): HttpRequestSendParams {
		const { timeout, dispatcher, username, password, redirect, method, replacements } = params;
		const { headers, query, queryOptions, body, json, form } = params;

		if ([body, json, form].filter(Boolean).length > 1) {
			throw new Error('body, json and form are mutually exclusive');
		}

		const joinedUrl = this.httpModuleOptions.baseUrl ? `${this.httpModuleOptions.baseUrl}/${url}` : url;

		const { protocol, host, pathname: path } = new URL(joinedUrl);
		const scheme = protocol.replace(':', '');

		return {
			timeout: timeout ?? this.httpModuleOptions.timeout ?? this.defaultOptions.timeout,
			dispatcher: dispatcher || this.httpModuleOptions.dispatcher,
			username: username || this.httpModuleOptions.username,
			password: password || this.httpModuleOptions.password,
			redirect: redirect || this.httpModuleOptions.redirect,
			method: method || HttpMethod.GET,
			url: joinedUrl,
			scheme,
			host,
			path,
			replacements,
			headers: this.httpModuleOptions.headers ? { ...this.httpModuleOptions.headers, ...headers } : headers || {},
			query,
			queryOptions,
			body,
			json,
			form,
		};
	}

	/**
	 * Build all necessary variables for telemetry.
	 * @param params
	 */
	private buildTelemetryParams(params: HttpRequestSendParams): HttpTelemetrySendParams {
		const { method, scheme, host, path } = params;

		const spanOptions: SpanOptions = {
			attributes: {
				'http.method': method,
				'http.scheme': scheme,
				'http.host': host,
				'http.route': path,
			},
		};

		return {
			start: Date.now(),
			cacheStatus: CacheStatus.DISABLED,
			spanOptions,
		};
	}

	/**
	 * Merge request retry options with module level and calculate
	 * maximum limit as well as return allowed codes and delay.
	 * @param method
	 * @param params
	 */
	private buildRetryParams(method: HttpMethod, params: HttpRequestOptions): HttpRetrySendParams {
		const { retryLimit: paramsLimit, retryCodes: paramsCodes, retryDelay: paramsDelay } = params;
		const { retryLimit: moduleLimit, retryCodes: moduleCodes } = this.httpModuleOptions;
		const { retryMethods: moduleMethods, retryDelay: moduleDelay } = this.httpModuleOptions;
		const { retryLimit: defaultLimit, retryCodes: defaultCodes } = this.defaultOptions;
		const { retryMethods: defaultMethods, retryDelay: defaultDelay } = this.defaultOptions;

		const retryLimitBase = paramsLimit ?? moduleLimit ?? defaultLimit;
		const retryMethods = moduleMethods ?? defaultMethods;
		const retryCodes = paramsCodes ?? moduleCodes ?? defaultCodes;
		const retryDelay = paramsDelay ?? moduleDelay ?? defaultDelay;

		const isRetryable = !!paramsLimit || paramsLimit === 0 || retryMethods.includes(method);
		const retryLimit = isRetryable ? retryLimitBase + 1 : 1;

		return { retryLimit, retryCodes, retryDelay, attempt: 0 };
	}

	/**
	 * Merge cache options with module level.
	 * @param method
	 * @param params
	 */
	private buildCacheParams(method: HttpMethod, params: HttpRequestOptions): HttpCacheSendParams {
		const { cacheTtl: paramsTtl, cacheTimeout: paramsTimeout } = params;
		const { cacheTtl: moduleTtl, cacheTimeout: moduleTimeout, cacheMethods: moduleMethods } = this.httpModuleOptions;
		const { cacheTtl: defaultTtl, cacheTimeout: defaultTimeout, cacheMethods: defaultMethods } = this.defaultOptions;

		const cacheTtlBase = paramsTtl ?? moduleTtl ?? defaultTtl;
		const cacheTimeout = paramsTimeout ?? moduleTimeout ?? defaultTimeout;
		const cacheMethods = moduleMethods ?? defaultMethods;

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
	private buildRequestSendParams(url: string, params: HttpRequestOptions): HttpSendParams {
		const { fullResponse, ignoreExceptions, proxyExceptions, parser } = params;
		const request = this.buildRequestParams(url, params);

		return {
			fullResponse: fullResponse ?? this.httpModuleOptions.fullResponse,
			ignoreExceptions: ignoreExceptions ?? this.httpModuleOptions.ignoreExceptions,
			proxyExceptions: proxyExceptions ?? this.httpModuleOptions.proxyExceptions,
			parser: parser || this.httpModuleOptions.parser || this.defaultOptions.parser,
			request,
			retry: this.buildRetryParams(request.method, params),
			cache: this.buildCacheParams(request.method, params),
			telemetry: this.buildTelemetryParams(request),
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
	public async request<T>(url: string, params: HttpRequestOptions): Promise<T> {
		const sendParams = this.buildRequestSendParams(url, params);
		const { fullResponse } = sendParams;
		let response: HttpResponse<T> | undefined;

		while (!response) {
			response = await this.sendRequestRetryHandler(sendParams);
		}

		return fullResponse ? (response as T) : (response.data as T);
	}

	/**
	 * Orchestrates HTTP request retry exception handler, upon failure
	 * check if there are attempts left, in which case do not throw
	 * the loop handler may try again.
	 * @param params
	 */
	private async sendRequestRetryHandler<T>(params: HttpSendParams): Promise<HttpResponse<T> | undefined> {
		const { retry } = params;
		const { retryLimit, retryCodes, retryDelay } = retry;
		let response: HttpResponse<T> | undefined;

		retry.attempt++;

		const { attempt } = retry;

		try {
			const isTimedOut = ContextStorage.getStore()?.get(ContextStorageKey.REQUEST_TIMED_OUT);
			if (isTimedOut) throw new Error(HttpTimeoutMessage.INBOUND);

			response = await this.sendRequestSpanHandler(params);
		} catch (e) {
			const error = e as HttpError;
			const attemptResponse = error.response?.outboundResponse;
			const isRetryableCode = !attemptResponse?.code || retryCodes.includes(attemptResponse?.code as HttpStatus);
			const attemptsLeft = retryLimit - attempt;

			if (!attemptsLeft || !isRetryableCode || error.message === HttpTimeoutMessage.INBOUND) {
				throw error;
			}

			const delay = retryDelay(attempt);
			this.logService?.warning({ attempt, retryLimit, retryDelay: delay }, error as Error);

			await setTimeout(delay);
		}

		return response;
	}

	/**
	 * Orchestrates HTTP request sending within tracing span,
	 * builds its name based on parameters.
	 * @param params
	 */
	private async sendRequestSpanHandler<T>(params: HttpSendParams): Promise<HttpResponse<T> | undefined> {
		const { request, telemetry } = params;
		const { method, url } = request;
		const { spanOptions } = telemetry;

		const spanName = `Http | ⯅ ${method} ${url}`;

		return this.traceService
			? await this.traceService.startActiveSpan(spanName, spanOptions, async (span: Span) => {
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
	private async sendRequestClientHandler<T>(params: HttpSendParams): Promise<HttpResponse<T> | undefined> {
		params.telemetry.start = Date.now();

		this.injectPropagationHeaders(params);
		this.logHttpMessage(params);

		try {
			params.response = await this.sendRequestCacheHandler(params);
		} catch (e) {
			const error = e as HttpFetchError;
			params.response = error.response;
			params.error = error;

			if (!params.ignoreExceptions) {
				this.handleRequestException(params);
			}
		} finally {
			this.collectOutboundTelemetry(params);
		}

		return params.response;
	}

	/**
	 * Orchestrates HTTP request sending with distributed cache support.
	 * @param params
	 */
	private async sendRequestCacheHandler<T>(params: HttpSendParams): Promise<HttpResponse<T>> {
		const { parser, request, telemetry, cache } = params;
		const { cacheTtl: ttl, cacheTimeout } = cache;
		const { host, method, path: rawPath, query, replacements } = request;

		const traffic = AppTraffic.OUTBOUND;
		const path = this.replaceUrlPlaceholders(rawPath, replacements);
		const cacheParams = { traffic, host, method, path, query, timeout: cacheTimeout };
		telemetry.cacheStatus = CacheStatus.DISABLED;

		let response: HttpResponse<T> | undefined;

		if (ttl) {
			try {
				response = await this.cacheService?.getCache(cacheParams);
			} catch (e) {
				this.logService?.warning('Failed to acquire outbound cached data', e as Error);
			}

			if (response) {
				this.logService?.debug('Resolving outbound request with cached data');
				telemetry.cacheStatus = CacheStatus.HIT;
				return response;
			}
		}

		response = await this.sendRequestFetchHandler(params);

		response.cookies = this.parseCookies(response);
		response.data = (await parser(response)) as T;

		const { status, data } = response;

		if (status >= HttpStatus.BAD_REQUEST) {
			throw new HttpFetchError(`Request failed with status code ${status}`, response);
		}

		if (ttl) {
			telemetry.cacheStatus = CacheStatus.MISS;
			this.cacheService?.setCache({ status, data }, { ...cacheParams, ttl });
		}

		return response;
	}

	/**
	 * Orchestrates HTTP request sending using Node.js fetch,
	 * apply final transformations and header injections if
	 * applicable.
	 * @param params
	 */
	private async sendRequestFetchHandler<T>(params: HttpSendParams): Promise<HttpResponse<T>> {
		const { request } = params;
		const { timeout, dispatcher, username, password, redirect, method, url, replacements } = request;
		const { headers, query, queryOptions, body, json, form } = request;

		const finalQuery = query ? qs.stringify(query, queryOptions) : undefined;
		const finalUrl = this.replaceUrlPlaceholders(url, replacements);
		let finalBody: any;

		if (json) {
			headers['Content-Type'] = 'application/json';
			finalBody = JSON.stringify(json);
		} else if (form) {
			headers['Content-Type'] = 'application/x-www-form-urlencoded';
			finalBody = new URLSearchParams(form);
		} else {
			finalBody = body;
		}

		if (username) {
			headers.Authorization = `Basic ${Buffer.from(`${username}:${password}`).toString('base64')}`;
		}

		const fetchOptions = {
			dispatcher,
			redirect,
			method,
			headers,
			body: finalBody,
			signal: timeout ? AbortSignal.timeout(timeout) : undefined,
		};

		return fetch(`${finalUrl}${finalQuery ? `?${finalQuery}` : ''}`, fetchOptions);
	}

	/**
	 * Adds tracing propagation headers to HTTP request.
	 * @param params
	 */
	private injectPropagationHeaders(params: HttpSendParams): void {
		const { request, span } = params;

		if (span && !this.httpModuleOptions.disablePropagation) {
			const ctx = this.traceService?.getContextBySpan(span);
			propagation.inject(ctx as Context, request.headers);
		}
	}

	/**
	 * Create log record of outbound http request.
	 * @param params
	 */
	private logHttpMessage(params: HttpSendParams): void {
		const { request } = params;
		const { method, url, scheme, host, path, replacements, query, body: reqBody, headers } = request;
		const body = this.appConfig.APP_OPTIONS.logs?.enableRequestBody ? reqBody : undefined;

		this.logService?.http(`⯅ ${method} ${url}`, {
			method,
			scheme,
			host,
			path,
			replacements,
			query,
			body,
			headers,
		});
	}

	/**
	 * Given http response headers, acquire its parsed cookies.
	 * @param response
	 */
	private parseCookies(response: Response): HttpCookie[] {
		const { headers } = response;
		const setCookie = headers.get('set-cookie');
		const cookies: HttpCookie[] = [];
		if (!setCookie) return cookies;

		const setCookieArray = setCookie.split(/(?<!expires=\w{3}),/).map((c) => c.trim());

		for (const cookie of setCookieArray) {
			const name = /^(.+?)=/gi.exec(cookie);
			const value = /^.+?=(.+?)(?:$|;)/gi.exec(cookie);
			const path = /path=(.+?)(?:$|;)/gi.exec(cookie);
			const domain = /domain=(.+?)(?:$|;)/gi.exec(cookie);
			const expires = /expires=(.+?)(?:$|;)/gi.exec(cookie);
			if (!name || !value) continue;

			cookies.push({
				name: name[1],
				value: value[1],
				path: path ? path[1] : undefined,
				domain: domain ? domain[1] : undefined,
				expires: expires ? new Date(expires[1]) : undefined,
			});
		}

		return cookies;
	}

	/**
	 * Register logs, metrics and tracing of outbound request.
	 * @param params
	 */
	private collectOutboundTelemetry(params: HttpSendParams): void {
		const { telemetry, span, request, response, error } = params;
		const { start, cacheStatus: cache } = telemetry;
		const { url, method, host, path } = request;
		const { status, data: resBody, headers } = response || {};
		const duration = (Date.now() - start) / 1000;

		const traffic = AppTraffic.OUTBOUND;
		const code = status || HttpStatus.INTERNAL_SERVER_ERROR;
		const body = this.appConfig.APP_OPTIONS.logs?.enableResponseBody ? resBody || undefined : undefined;

		this.logService?.http(`⯆ ${method} ${url}`, { duration, code, body, headers });
		this.metricService?.observeHttpDuration({ traffic, method, host, path, code, cache, duration });

		if (span) {
			span.setAttributes({
				'http.status_code': String(code) || undefined,
				'http.duration': duration,
			});

			if (error) {
				span.recordException(error);
				span.setStatus({ code: SpanStatusCode.ERROR, message: error.message });
			} else {
				span.setStatus({ code: SpanStatusCode.OK });
			}

			span.end();
		}
	}

	/**
	 * Standardize the output in case of a request exception.
	 *
	 * If the proxy option has been set, throws a NestJS http
	 * exception with matching code.
	 * @param params
	 */
	private handleRequestException(params: HttpSendParams): void {
		const { proxyExceptions, request, response, error } = params;
		const { message: errorMessage, cause: errorCause } = error || {};
		const { method, url, timeout } = request;

		const code: HttpStatus = proxyExceptions && response?.status ? response?.status : HttpStatus.INTERNAL_SERVER_ERROR;

		const cause = errorCause as Error;

		const message = errorMessage?.startsWith(HttpTimeoutMessage.OUTBOUND)
			? `Request timed out after ${timeout} ms`
			: errorCause
				? cause.message
				: errorMessage;

		const exceptionData: HttpErrorResponse = {
			message: `⯆ ${method} ${url} | ${message}`,
			proxyExceptions,
			outboundRequest: request,
			outboundResponse: cause
				? undefined
				: {
						code: response?.status,
						headers: response?.headers
							? Object.fromEntries(response.headers as unknown as Iterable<readonly [PropertyKey, string]>)
							: {},
						body: response?.data,
					},
		};

		throw new HttpException(exceptionData, code);
	}

	/**
	 * Send a GET request.
	 * @param url
	 * @param params
	 */
	public async get<T>(url: string, params: HttpRequestOptions = {}): Promise<T> {
		return this.request<T>(url, { ...params, method: HttpMethod.GET });
	}

	/**
	 * Send a HEAD request.
	 * @param url
	 * @param params
	 */
	public async head<T>(url: string, params: HttpRequestOptions = {}): Promise<T> {
		return this.request<T>(url, { ...params, method: HttpMethod.HEAD });
	}

	/**
	 * Send a POST request.
	 * @param url
	 * @param params
	 */
	public async post<T>(url: string, params: HttpRequestOptions = {}): Promise<T> {
		return this.request<T>(url, { ...params, method: HttpMethod.POST });
	}

	/**
	 * Send a PUT request.
	 * @param url
	 * @param params
	 */
	public async put<T>(url: string, params: HttpRequestOptions = {}): Promise<T> {
		return this.request<T>(url, { ...params, method: HttpMethod.PUT });
	}

	/**
	 * Send a DELETE request.
	 * @param url
	 * @param params
	 */
	public async delete<T>(url: string, params: HttpRequestOptions = {}): Promise<T> {
		return this.request<T>(url, { ...params, method: HttpMethod.DELETE });
	}

	/**
	 * Send an OPTIONS request.
	 * @param url
	 * @param params
	 */
	public async options<T>(url: string, params: HttpRequestOptions = {}): Promise<T> {
		return this.request<T>(url, { ...params, method: HttpMethod.OPTIONS });
	}

	/**
	 * Send a PATCH request.
	 * @param url
	 * @param params
	 */
	public async patch<T>(url: string, params: HttpRequestOptions = {}): Promise<T> {
		return this.request<T>(url, { ...params, method: HttpMethod.PATCH });
	}
}
