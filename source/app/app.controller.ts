import { Controller, Get, HttpCode, HttpStatus } from '@nestjs/common';
import { ApiExcludeController } from '@nestjs/swagger';

import { AppStatusDto } from './app.dto.out';
import { AppService } from './app.service';

@Controller()
@ApiExcludeController()
export class AppController {

  public constructor(
    private readonly appService: AppService,
  ) { }

  @Get()
  @HttpCode(HttpStatus.NO_CONTENT)
  public get(): void {
    return;
  }

  @Get('status')
  public getStatus(): AppStatusDto {
    return this.appService.getStatus();
  }

}
