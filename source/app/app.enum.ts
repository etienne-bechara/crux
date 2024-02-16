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

export enum AppReflectorKey {
  RESPONSE_BODY = 'RESPONSE_BODY',
}
