import { Global, Module } from '@nestjs/common';

import { LogService } from './log.service';

@Global()
@Module({
  providers: [
    LogService,
  ],
  exports: [
    LogService,
  ],
})
export class LogModule { }
