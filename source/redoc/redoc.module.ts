import { Module } from '@nestjs/common';

import { RedocController } from './redoc.controller';
import { RedocService } from './redoc.service';

@Module({
  controllers: [
    RedocController,
  ],
  providers: [
    RedocService,
  ],
  exports: [
    RedocService,
  ],
})
export class RedocModule { }
