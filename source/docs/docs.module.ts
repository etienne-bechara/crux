import { Module } from '@nestjs/common';

import { DocsController } from './docs.controller';
import { DocsService } from './docs.service';

@Module({
  controllers: [
    DocsController,
  ],
  providers: [
    DocsService,
  ],
  exports: [
    DocsService,
  ],
})
export class DocsModule { }
