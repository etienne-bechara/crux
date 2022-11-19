import { Global, Module } from '@nestjs/common';

import { MemoryService } from './memory.service';

@Global()
@Module({
  providers: [
    MemoryService,
  ],
  exports: [
    MemoryService,
  ],
})
export class MemoryModule { }
