import { Module } from '@nestjs/common';

import { MetricConfig } from './metric.config';
import { MetricController } from './metric.controller';
import { MetricService } from './metric.service';

@Module({
  controllers: [MetricController],
  providers: [MetricConfig, MetricService],
  exports: [MetricConfig, MetricService],
})
export class MetricModule {}

@Module({
  providers: [{ provide: MetricService, useValue: null }],
  exports: [{ provide: MetricService, useValue: null }],
})
export class MetricDisabledModule {}
