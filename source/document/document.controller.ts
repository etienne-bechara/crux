import { Header, Render } from '@nestjs/common';

import { Controller, Get } from '../app/app.decorator';
import { AppMemory } from '../app/app.enum';
import { MemoryService } from '../memory/memory.service';
import { DocumentSpecification } from './document.dto';
import { DocumentOptions } from './document.interface';
import { DocumentService } from './document.service';

// eslint-disable-next-line max-len
const securityPolicy = "default-src * 'unsafe-inline' 'unsafe-eval'; script-src * 'unsafe-inline' 'unsafe-eval'; child-src * 'unsafe-inline' 'unsafe-eval' blob:; worker-src * 'unsafe-inline' 'unsafe-eval' blob:; connect-src * 'unsafe-inline'; img-src * data: blob: 'unsafe-inline'; frame-src *; style-src * 'unsafe-inline';";

@Controller('docs', {
  tags: [ 'Application' ],
})
export class DocumentController {

  public constructor(
    private readonly documentService: DocumentService,
    private readonly memoryService: MemoryService<AppMemory>,
  ) { }

  @Get({ hidden: true })
  @Render('document.handlebars')
  @Header('Content-Security-Policy', securityPolicy)
  public getDocs(): DocumentOptions {
    return this.documentService.buildRenderOptions();
  }

  @Get('json', {
    operationId: 'Read OpenAPI Spec',
    description: 'Generate OpenAPI specification in JSON format, useful for importing at request clients.',
    response: { type: DocumentSpecification },
  })
  public getDocsJson(): DocumentSpecification {
    const document = this.memoryService.getKey('openApiSpecification');
    return JSON.parse(document);
  }

}
