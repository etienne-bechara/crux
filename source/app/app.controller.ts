import { Controller, Get, HttpCode, HttpStatus } from '@nestjs/common';
import { ApiExcludeEndpoint } from '@nestjs/swagger';

import { AppStatus } from './app.dto';
import { AppService } from './app.service';

@Controller()
export class AppController {

  public constructor(
    private readonly appService: AppService,
  ) { }

  @Get()
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiExcludeEndpoint()
  public get(): void {
    return;
  }

  @Get('status')
  @ApiExcludeEndpoint()
  public getStatus(): AppStatus {
    return this.appService.getStatus();
  }

}
