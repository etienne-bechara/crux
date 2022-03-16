import { Module } from '@nestjs/common';

import { CsvConfig } from './csv.config';
import { CsvController } from './csv.controller';
import { CsvService } from './csv.service';

@Module({
  controllers: [
    CsvController,
  ],
  providers: [
    CsvConfig,
    CsvService,
  ],
  exports: [
    CsvConfig,
    CsvService,
  ],
})
export class CsvModule { }
