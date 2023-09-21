export enum HttpInjectionToken {
  HTTP_MODULE_ID = 'HTTP_MODULE_ID',
  HTTP_MODULE_OPTIONS = 'HTTP_MODULE_OPTIONS',
}

export enum HttpMethod {
  GET = 'GET',
  HEAD = 'HEAD',
  POST = 'POST',
  PUT = 'PUT',
  DELETE = 'DELETE',
  CONNECT = 'CONNECT',
  OPTIONS = 'OPTIONS',
  TRACE = 'TRACE',
  PATCH = 'PATCH',
}

export enum HttpRedirect {
  ERROR = 'error',
  FOLLOW = 'follow',
  MANUAL = 'manual',
}

export enum HttpParser {
  BUFFER = 'BUFFER',
  JSON = 'JSON',
  TEXT = 'TEXT',
}
