import { Global, Module } from '@nestjs/common';

import { PromiseService } from './promise.service';

@Global()
@Module({
  providers: [
    PromiseService,
  ],
  exports: [
    PromiseService,
  ],
})
export class PromiseModule { }
