import { Module } from '@nestjs/common';

import { LoggerModule } from '../logger/logger.module';
import { AsyncService } from './async.service';

@Module({
  imports: [
    LoggerModule,
  ],
  providers: [
    AsyncService,
  ],
  exports: [
    AsyncService,
  ],
})
export class AsyncModule { }
