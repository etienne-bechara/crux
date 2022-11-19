import { Global, Module } from '@nestjs/common';

import { ContextService } from './context.service';

@Global()
@Module({
  providers: [
    ContextService,
  ],
  exports: [
    ContextService,
  ],
})
export class ContextModule { }
