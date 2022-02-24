import { Module } from '@nestjs/common';

import { AsyncService } from './async.service';

@Module({
  providers: [
    AsyncService,
  ],
  exports: [
    AsyncService,
  ],
})
export class AsyncModule { }
