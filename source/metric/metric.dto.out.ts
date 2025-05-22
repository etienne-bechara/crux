import { MetricAggregator, MetricDataType } from './metric.enum';

export interface MetricValueDto {
	metricName: string;
	value: number;
	labels: Record<string, string>;
}

export interface MetricDataDto {
	name: string;
	help: string;
	type: MetricDataType;
	aggregator: MetricAggregator;
	values: MetricValueDto[];
}
