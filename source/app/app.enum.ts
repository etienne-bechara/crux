export enum AppEnvironment {
  PRODUCTION = 'production',
  STAGING = 'staging',
  DEVELOPMENT = 'development',
  LOCAL = 'local',
  TEST = 'test',
}

export enum AppMetric {
  HTTP_INBOUND_DURATION = 'http_inbound_duration_seconds',
  HTTP_INBOUND_INGRESS = 'http_inbound_ingress_bytes',
  HTTP_INBOUND_EGRESS = 'http_inbound_egress_bytes',
  HTTP_OUTBOUND_DURATION = 'http_outbound_duration_seconds',
  HTTP_OUTBOUND_INGRESS = 'http_outbound_ingress_bytes',
  HTTP_OUTBOUND_EGRESS = 'http_outbound_egress_bytes',
}
