import { Module } from '@nestjs/common';
import { APP_INTERCEPTOR } from '@nestjs/core';

import { MetricConfig } from './metric.config';
import { MetricController } from './metric.controller';
import { MetricInterceptor } from './metric.interceptor';
import { MetricService } from './metric.service';

@Module({
  controllers: [
    MetricController,
  ],
  providers: [
    { provide: APP_INTERCEPTOR, useClass: MetricInterceptor },
    MetricConfig,
    MetricService,
  ],
  exports: [
    MetricConfig,
    MetricService,
  ],
})
export class MetricModule { }

@Module({
  providers: [
    { provide: MetricConfig, useValue: null },
    { provide: MetricService, useValue: null },
  ],
  exports: [
    { provide: MetricConfig, useValue: null },
    { provide: MetricService, useValue: null },
  ],
})
export class MetricDisabledModule { }
