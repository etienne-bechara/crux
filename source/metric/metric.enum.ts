export enum MetricDataType {
  COUNTER = 'counter',
  GAUGE = 'gauge',
  HISTOGRAM = 'histogram',
  SUMMARY = 'summary',
}

export enum MetricAggregator {
  OMIT = 'omit',
  SUM = 'sum',
  FIRST = 'first',
  MIN = 'min',
  MAX = 'max',
  AVERAGE = 'average',
}

export enum MetricPushStrategy {
  PUSHGATEWAY = 'PUSHGATEWAY',
  REMOTE_WRITE = 'REMOTE_WRITE',
}
