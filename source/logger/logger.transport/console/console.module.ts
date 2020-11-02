import { Module } from '@nestjs/common';

import { ConsoleConfig } from './console.config';
import { ConsoleService } from './console.service';

@Module({
  providers: [ ConsoleConfig, ConsoleService ],
})
export class ConsoleModule { }
