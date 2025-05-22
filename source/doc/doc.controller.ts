import { Controller, Get, Header } from '@nestjs/common';
import { ApiExcludeController } from '@nestjs/swagger';

import { AppMemoryKey } from '../app/app.enum';
import { MemoryService } from '../memory/memory.service';
import { DocJsonDto } from './doc.dto.out';
import { DocService } from './doc.service';

@Controller('docs')
@ApiExcludeController()
export class DocController {
  public constructor(
    private readonly docService: DocService,
    private readonly memoryService: MemoryService,
  ) {}

  @Get()
  @Header('Content-Type', 'text/html')
  public getDocs(): string {
    return this.docService.generateScalarHtml();
  }

  @Get('json')
  public getDocsJson(): DocJsonDto {
    return this.memoryService.get(AppMemoryKey.OPEN_API_SPECIFICATION);
  }
}
