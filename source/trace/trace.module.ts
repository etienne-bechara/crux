import { Module } from '@nestjs/common';
import { APP_INTERCEPTOR } from '@nestjs/core';

import { TraceConfig } from './trace.config';
import { TraceInterceptor } from './trace.interceptor';
import { TraceService } from './trace.service';

@Module({
  providers: [
    { provide: APP_INTERCEPTOR, useClass: TraceInterceptor },
    TraceConfig,
    TraceService,
  ],
  exports: [
    TraceConfig,
    TraceService,
  ],
})
export class TraceModule { }

@Module({
  providers: [
    { provide: TraceService, useValue: null },
  ],
  exports: [
    { provide: TraceService, useValue: null },
  ],
})
export class TracerDisabledModule { }
