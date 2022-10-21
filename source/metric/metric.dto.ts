import { IsEnum, IsNumber, IsObject, IsString } from '../validate/validate.decorator';
import { MetricAggregator, MetricDataType } from './metric.enum';

export class MetricValue {

  @IsString()
  public metricName: string;

  @IsNumber()
  public value: number;

  @IsObject()
  public labels: Record<string, string>;

}

export class MetricData {

  @IsString()
  public name: string;

  @IsString()
  public help: string;

  @IsEnum(MetricDataType)
  public type: MetricDataType;

  @IsEnum(MetricAggregator)
  public aggregator: MetricAggregator;

  @IsObject(MetricValue, { each: true })
  public values: MetricValue[];

}
