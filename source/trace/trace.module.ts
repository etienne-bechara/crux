import { Module } from '@nestjs/common';

import { TraceConfig } from './trace.config';
import { TraceService } from './trace.service';

@Module({
  providers: [
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
