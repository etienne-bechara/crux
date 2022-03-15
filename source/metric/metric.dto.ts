import { ApiProperty } from '@nestjs/swagger';
import { Type } from 'class-transformer';

import { ToBoolean } from '../transform/transform.decorator';
import { IsBoolean, IsIn, IsNumber, IsObject, IsOptional, IsString, ValidateNested } from '../validator/validator.decorator';
import { MetricAggregator, MetricDataType } from './metric.enum';

export class MetricReadDto {

  @ApiProperty({ default: false })
  @IsOptional()
  @ToBoolean()
  @IsBoolean()
  public json?: boolean;

}

export class MetricValue {

  @IsNumber()
  public value: number;

  @IsObject()
  public labels: Record<string, string>;

}

export class MetricData {

  @IsString()
  public help: string;

  @IsString()
  public name: string;

  @IsIn(Object.values(MetricDataType))
  public type: MetricDataType;

  @ApiProperty({ type: [ MetricValue ] })
  @ValidateNested()
  @Type(() => MetricValue)
  @IsObject({ each: true })
  public values: MetricValue[];

  @IsIn(Object.values(MetricAggregator))
  public aggregator: MetricAggregator;

}
