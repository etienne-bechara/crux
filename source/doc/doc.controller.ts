import { Controller, Get, Render } from '@nestjs/common';
import { ApiExcludeController } from '@nestjs/swagger';
import fs from 'fs';

import { AppMemoryKey } from '../app/app.enum';
import { MemoryService } from '../memory/memory.service';
import { DocSpecification } from './doc.dto';
import { DocOptions } from './doc.interface';
import { DocService } from './doc.service';

const sourcePath = 'source/doc/doc.view.hbs';
const packagePath = 'node_modules/@bechara/crux/dist/doc/doc.view.hbs';
const renderPath = fs.existsSync(sourcePath) ? sourcePath : packagePath;

@Controller('docs')
@ApiExcludeController()
export class DocController {

  public constructor(
    private readonly documentService: DocService,
    private readonly memoryService: MemoryService,
  ) { }

  @Get()
  @Render(renderPath)
  public getDocs(): DocOptions {
    return this.documentService.buildRenderOptions();
  }

  @Get('json')
  public getDocsJson(): DocSpecification {
    return this.memoryService.get(AppMemoryKey.OPEN_API_SPECIFICATION);
  }

}
