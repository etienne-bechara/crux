import { Module } from '@nestjs/common';
import { APP_INTERCEPTOR } from '@nestjs/core';

import { TracerConfig } from './tracer.config';
import { TracerInterceptor } from './tracer.interceptor';
import { TracerService } from './tracer.service';

@Module({
  providers: [
    { provide: APP_INTERCEPTOR, useClass: TracerInterceptor },
    TracerConfig,
    TracerService,
  ],
  exports: [
    TracerConfig,
    TracerService,
  ],
})
export class TracerModule { }

@Module({
  providers: [
    { provide: TracerService, useValue: null },
  ],
  exports: [
    { provide: TracerService, useValue: null },
  ],
})
export class TracerDisabledModule { }
