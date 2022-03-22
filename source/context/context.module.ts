import { Module } from '@nestjs/common';
import { APP_INTERCEPTOR } from '@nestjs/core';

import { ContextInterceptor } from './context.interceptor';
import { ContextService } from './context.service';

@Module({
  providers: [
    { provide: APP_INTERCEPTOR, useClass: ContextInterceptor },
    ContextService,
  ],
  exports: [
    ContextService,
  ],
})
export class ContextModule { }
