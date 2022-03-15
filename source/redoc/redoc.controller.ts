import { Header, Render } from '@nestjs/common';

import { Controller, Get } from '../app/app.decorator';
import { AppMemory } from '../app/app.enum';
import { MemoryService } from '../memory/memory.service';
import { RedocSpecification } from './redoc.dto';
import { RedocAppOptions } from './redoc.interface';
import { RedocService } from './redoc.service';

// eslint-disable-next-line max-len
const securityPolicy = "default-src * 'unsafe-inline' 'unsafe-eval'; script-src * 'unsafe-inline' 'unsafe-eval'; child-src * 'unsafe-inline' 'unsafe-eval' blob:; worker-src * 'unsafe-inline' 'unsafe-eval' blob:; connect-src * 'unsafe-inline'; img-src * data: blob: 'unsafe-inline'; frame-src *; style-src * 'unsafe-inline';";

@Controller('docs', {
  tags: [ 'Application' ],
})
export class RedocController {

  public constructor(
    private readonly memoryService: MemoryService<AppMemory>,
    private readonly redocService: RedocService,
  ) { }

  @Get({ hidden: true })
  @Render('redoc.handlebars')
  @Header('Content-Security-Policy', securityPolicy)
  public getDocs(): RedocAppOptions {
    return this.redocService.buildRenderOptions();
  }

  @Get('json', {
    operationId: 'Read OpenAPI Spec',
    description: 'Generate OpenAPI specification in JSON format, useful for importing at request clients.',
    response: { type: RedocSpecification },
  })
  public getDocsJson(): RedocSpecification {
    const document = this.memoryService.getKey('openApiSpecification');
    return JSON.parse(document);
  }

}
