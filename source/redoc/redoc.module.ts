import { Module } from '@nestjs/common';

import { RedocConfig } from './redoc.config';
import { RedocController } from './redoc.controller';
import { RedocService } from './redoc.service';

@Module({
  controllers: [
    RedocController,
  ],
  providers: [
    RedocConfig,
    RedocService,
  ],
  exports: [
    RedocConfig,
    RedocService,
  ],
})
export class RedocModule { }
