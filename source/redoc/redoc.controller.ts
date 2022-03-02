import { Controller, Get, Header, Render } from '@nestjs/common';
import { ApiExcludeController } from '@nestjs/swagger';

import { RedocAppOptions } from './redoc.interface';
import { RedocService } from './redoc.service';

// eslint-disable-next-line max-len
const securityPolicy = "default-src * 'unsafe-inline' 'unsafe-eval'; script-src * 'unsafe-inline' 'unsafe-eval'; child-src * 'unsafe-inline' 'unsafe-eval' blob:; worker-src * 'unsafe-inline' 'unsafe-eval' blob:; connect-src * 'unsafe-inline'; img-src * data: blob: 'unsafe-inline'; frame-src *; style-src * 'unsafe-inline';";

@ApiExcludeController()
@Controller('docs')
export class RedocController {

  public constructor(
    private readonly redocService: RedocService,
  ) { }

  @Get()
  @Render('redoc.handlebars')
  @Header('Content-Security-Policy', securityPolicy)
  public getDocs(): RedocAppOptions {
    return this.redocService.buildRenderOptions();
  }

}
