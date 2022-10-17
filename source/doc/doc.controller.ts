import { Controller, Get, Header, Render } from '@nestjs/common';
import { ApiExcludeEndpoint } from '@nestjs/swagger';

import { AppMemoryKey } from '../app/app.enum';
import { MemoryService } from '../memory/memory.service';
import { DocSpecification } from './doc.dto';
import { DocOptions } from './doc.interface';
import { DocService } from './doc.service';

// eslint-disable-next-line max-len
const securityPolicy = "default-src * 'unsafe-inline' 'unsafe-eval'; script-src * 'unsafe-inline' 'unsafe-eval'; child-src * 'unsafe-inline' 'unsafe-eval' blob:; worker-src * 'unsafe-inline' 'unsafe-eval' blob:; connect-src * 'unsafe-inline'; img-src * data: blob: 'unsafe-inline'; frame-src *; style-src * 'unsafe-inline';";

@Controller('docs')
export class DocController {

  public constructor(
    private readonly documentService: DocService,
    private readonly memoryService: MemoryService,
  ) { }

  @Get()
  @Render('doc.handlebars')
  @Header('Content-Security-Policy', securityPolicy)
  @ApiExcludeEndpoint()
  public getDocs(): DocOptions {
    return this.documentService.buildRenderOptions();
  }

  @Get('json')
  @ApiExcludeEndpoint()
  public getDocsJson(): DocSpecification {
    return this.memoryService.get(AppMemoryKey.OPEN_API_SPECIFICATION);
  }

}
