import { Module } from '@nestjs/common';
import { APP_INTERCEPTOR } from '@nestjs/core';

import { MetricController } from './metric.controller';
import { MetricInterceptor } from './metric.interceptor';
import { MetricService } from './metric.service';

@Module({
  controllers: [
    MetricController,
  ],
  providers: [
    { provide: APP_INTERCEPTOR, useClass: MetricInterceptor },
    MetricService,
  ],
  exports: [
    MetricService,
  ],
})
export class MetricModule { }
