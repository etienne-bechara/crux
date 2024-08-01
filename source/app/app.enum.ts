export enum AppEnvironment {
  PRODUCTION = 'production',
  STAGING = 'staging',
  DEVELOPMENT = 'development',
  LOCAL = 'local',
  TEST = 'test',
}

export enum AppMetric {
  HTTP_REQUEST_DURATION = 'http_request_duration_seconds',
}

export enum AppTraffic {
  INBOUND = 'inbound',
  OUTBOUND = 'outbound',
}

export enum AppMemoryKey {
  OPEN_API_SPECIFICATION = 'OPEN_API_SPECIFICATION',
}

export enum AppMetadataKey {
  CACHE_OPTIONS = 'CACHE_OPTIONS',
  RATE_LIMIT_OPTIONS = 'RATE_LIMIT_OPTIONS',
  RESPONSE_CLASS = 'RESPONSE_BODY',
}
