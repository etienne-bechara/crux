import { Field, Message, Type } from 'protobufjs';

import { MetricLabel, MetricMessage, MetricSample, MetricTimeseries } from './metric.interface';

@Type.d('MetricLabelProto')
export class MetricLabelProto extends Message<MetricLabelProto> implements MetricLabel {
  @Field.d(1, 'string', 'required')
  public name!: string;

  @Field.d(2, 'string', 'required')
  public value!: string;
}

@Type.d('MetricSampleProto')
export class MetricSampleProto extends Message<MetricSampleProto> implements MetricSample {
  @Field.d(1, 'double', 'required')
  public value!: number;

  @Field.d(2, 'int64', 'required')
  public timestamp!: number;
}

@Type.d('MetricTimeseriesProto')
export class MetricTimeseriesProto extends Message<MetricTimeseriesProto> implements MetricTimeseries {
  @Field.d(1, MetricLabelProto, 'repeated')
  public labels!: MetricLabel[];

  @Field.d(2, MetricSampleProto, 'repeated')
  public samples!: MetricSample[];
}

@Type.d('MetricMessageProto')
export class MetricMessageProto extends Message<MetricMessageProto> implements MetricMessage {
  @Field.d(1, MetricTimeseriesProto, 'repeated')
  public timeseries!: MetricTimeseries[];
}
