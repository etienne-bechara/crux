/* eslint-disable padding-line-between-statements */
/* eslint-disable @typescript-eslint/naming-convention */
/* eslint-disable jsdoc/require-jsdoc */
import { applyDecorators, Controller as NestController, Delete as NestDelete, Get as NestGet, Head as NestHead, HttpCode, HttpStatus, Options as NestOptions, Patch as NestPatch, Post as NestPost, Put as NestPut, RequestMethod } from '@nestjs/common';
import { ApiExcludeController, ApiExcludeEndpoint, ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';

import { AppControllerParams, AppMethodParams } from './app.interface';

/**
 * Decorator that marks a class as a Nest controller that can receive inbound
 * requests and produce responses.
 *
 * An HTTP Controller responds to inbound HTTP Requests and produces HTTP Responses.
 * It defines a class that provides the context for one or more related route
 * handlers that correspond to HTTP request methods and associated routes
 * for example `GET /api/profile`, `POST /users/resume`.
 *
 * A Microservice Controller responds to requests as well as events, running over
 * a variety of transports [(read more here)](https://docs.nestjs.com/microservices/basics).
 * It defines a class that provides a context for one or more message or event
 * handlers.
 *
 * @param prefix String that defines a `route path prefix`.  The prefix
 * is pre-pended to the path specified in any request decorator in the class.
 *
 * @param params
 * @see [Routing](https://docs.nestjs.com/controllers#routing)
 * @see [Controllers](https://docs.nestjs.com/controllers)
 * @see [Microservices](https://docs.nestjs.com/microservices/basics#request-response)
 */
export function Controller(prefix: string, params: AppControllerParams = { }): any {
  const { tags, hidden } = params;

  const decorators = [
    NestController(prefix),
    ApiTags(...tags || [ `${prefix.charAt(0).toUpperCase()}${prefix.slice(1)}` ]),
  ];

  if (hidden) {
    decorators.push(ApiExcludeController());
  }

  return applyDecorators(...decorators);
}

/**
 * Configure documentation decorators based on routing ones.
 * @param method
 * @param prefix
 * @param params
 */
function buildMethodDecorators(method: RequestMethod, prefix: string, params: AppMethodParams): MethodDecorator[] {
  const { tags, hidden, response } = params;
  const { status } = response || { };
  const decorators = [ ];
  let defaultStatus: HttpStatus;

  switch (method) {
    case RequestMethod.GET:
      decorators.push(NestGet(prefix));
      defaultStatus = HttpStatus.OK;
      break;

    case RequestMethod.POST:
      decorators.push(NestPost(prefix));
      defaultStatus = HttpStatus.CREATED;
      break;

    case RequestMethod.PUT:
      decorators.push(NestPut(prefix));
      defaultStatus = HttpStatus.OK;
      break;

    case RequestMethod.PATCH:
      decorators.push(NestPatch(prefix));
      defaultStatus = HttpStatus.OK;
      break;

    case RequestMethod.DELETE:
      decorators.push(NestDelete(prefix));
      defaultStatus = HttpStatus.NO_CONTENT;
      break;

    case RequestMethod.HEAD:
      decorators.push(NestHead(prefix));
      defaultStatus = HttpStatus.OK;
      break;

    case RequestMethod.OPTIONS:
      decorators.push(NestOptions(prefix));
      defaultStatus = HttpStatus.OK;
      break;
  }

  if (status) {
    decorators.push(HttpCode(status as number));
  }

  if (tags) {
    decorators.push(ApiTags(...tags));
  }

  if (hidden) {
    decorators.push(ApiExcludeEndpoint());
  }

  decorators.push(
    ApiOperation(params),
    ApiResponse(
      response
        ? { status: defaultStatus, ...response }
        : { status: defaultStatus || status },
    ),
  );

  return decorators;
}

/**
 * Split method prefix and params based on used signature.
 * @param args
 */
function getMethodParams(args: any[]): { prefix: string; params: AppMethodParams } {
  const prefix = args[0] && typeof args[0] === 'string' ? args[0] : '';
  const params = args[0] && typeof args[0] !== 'string' ? args[0] : args[1] || { };
  return { prefix, params };
}

/**
 * Route handler (method) Decorator. Routes HTTP GET requests to the specified path.
 *
 * @param prefix
 * @param params
 * @see [Routing](https://docs.nestjs.com/controllers#routing)
 */
export function Get(params?: AppMethodParams): any;
export function Get(prefix: string, params?: AppMethodParams): any;
export function Get(...args: any[]): any {
  const { prefix, params } = getMethodParams(args);
  const decorators = buildMethodDecorators(RequestMethod.GET, prefix, params);
  return applyDecorators(...decorators);
}

/**
 * Route handler (method) Decorator. Routes HTTP POST requests to the specified path.
 *
 * @param prefix
 * @param params
 * @see [Routing](https://docs.nestjs.com/controllers#routing)
 */
export function Post(params?: AppMethodParams): any;
export function Post(prefix: string, params?: AppMethodParams): any;
export function Post(...args: any[]): any {
  const { prefix, params } = getMethodParams(args);
  const decorators = buildMethodDecorators(RequestMethod.POST, prefix, params);
  return applyDecorators(...decorators);
}

/**
 * Route handler (method) Decorator. Routes HTTP PUT requests to the specified path.
 *
 * @param prefix
 * @param params
 * @see [Routing](https://docs.nestjs.com/controllers#routing)
 */
export function Put(params?: AppMethodParams): any;
export function Put(prefix: string, params?: AppMethodParams): any;
export function Put(...args: any[]): any {
  const { prefix, params } = getMethodParams(args);
  const decorators = buildMethodDecorators(RequestMethod.PUT, prefix, params);
  return applyDecorators(...decorators);
}

/**
 * Route handler (method) Decorator. Routes HTTP PATCH requests to the specified path.
 *
 * @param prefix
 * @param params
 * @see [Routing](https://docs.nestjs.com/controllers#routing)
 */
export function Patch(params?: AppMethodParams): any;
export function Patch(prefix: string, params?: AppMethodParams): any;
export function Patch(...args: any[]): any {
  const { prefix, params } = getMethodParams(args);
  const decorators = buildMethodDecorators(RequestMethod.PATCH, prefix, params);
  return applyDecorators(...decorators);
}

/**
 * Route handler (method) Decorator. Routes HTTP DELETE requests to the specified path.
 *
 * @param prefix
 * @param params
 * @see [Routing](https://docs.nestjs.com/controllers#routing)
 */
export function Delete(params?: AppMethodParams): any;
export function Delete(prefix: string, params?: AppMethodParams): any;
export function Delete(...args: any[]): any {
  const { prefix, params } = getMethodParams(args);
  const decorators = buildMethodDecorators(RequestMethod.DELETE, prefix, params);
  return applyDecorators(...decorators);
}

/**
 * Route handler (method) Decorator. Routes HTTP HEAD requests to the specified path.
 *
 * @param prefix
 * @param params
 * @see [Routing](https://docs.nestjs.com/controllers#routing)
 */
export function Head(params?: AppMethodParams): any;
export function Head(prefix: string, params?: AppMethodParams): any;
export function Head(...args: any[]): any {
  const { prefix, params } = getMethodParams(args);
  const decorators = buildMethodDecorators(RequestMethod.HEAD, prefix, params);
  return applyDecorators(...decorators);
}

/**
 * Route handler (method) Decorator. Routes HTTP OPTIONS requests to the specified path.
 *
 * @param prefix
 * @param params
 * @see [Routing](https://docs.nestjs.com/controllers#routing)
 */
export function Options(params?: AppMethodParams): any;
export function Options(prefix: string, params?: AppMethodParams): any;
export function Options(...args: any[]): any {
  const { prefix, params } = getMethodParams(args);
  const decorators = buildMethodDecorators(RequestMethod.OPTIONS, prefix, params);
  return applyDecorators(...decorators);
}
