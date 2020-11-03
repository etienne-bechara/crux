import { Module } from '@nestjs/common';

import { LoggerModule } from '../../logger.module';
import { ConsoleConfig } from './console.config';
import { ConsoleService } from './console.service';

@Module({
  imports: [
    LoggerModule,
  ],
  providers: [
    ConsoleConfig,
    ConsoleService,
  ],
})
export class ConsoleModule { }
