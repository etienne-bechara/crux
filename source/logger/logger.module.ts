import { Module } from '@nestjs/common';

import { LoggerConfig } from './logger.config';
import { LoggerService } from './logger.service';

@Module({
  providers: [ LoggerConfig, LoggerService ],
  exports: [ LoggerService ],
})
export class LoggerModule { }
