import { Global, Module } from '@nestjs/common';

import { ConsoleConfig } from './console.config';
import { ConsoleService } from './console.service';

@Global()
@Module({
  providers: [
    ConsoleConfig,
    ConsoleService,
  ],
  exports: [
    ConsoleConfig,
    ConsoleService,
  ],
})
export class ConsoleModule { }
