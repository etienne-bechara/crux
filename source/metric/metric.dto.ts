import { MetricAggregator, MetricDataType } from './metric.enum';

export interface MetricValue {
  metricName: string;
  value: number;
  labels: Record<string, string>;
}

export interface MetricData {
  name: string;
  help: string;
  type: MetricDataType;
  aggregator: MetricAggregator;
  values: MetricValue[];
}
