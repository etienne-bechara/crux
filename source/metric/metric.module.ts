import { Global, Module } from '@nestjs/common';

import { MetricConfig } from './metric.config';
import { MetricController } from './metric.controller';
import { MetricService } from './metric.service';

@Global()
@Module({
  controllers: [
    MetricController,
  ],
  providers: [
    MetricConfig,
    MetricService,
  ],
  exports: [
    MetricConfig,
    MetricService,
  ],
})
export class MetricModule { }

@Global()
@Module({
  providers: [
    { provide: MetricService, useValue: null },
  ],
  exports: [
    { provide: MetricService, useValue: null },
  ],
})
export class MetricDisabledModule { }
