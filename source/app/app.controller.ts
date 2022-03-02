import { Controller, Get, HttpCode, HttpStatus } from '@nestjs/common';

import { AppStatus } from './app.interface';
import { AppService } from './app.service';

@Controller()
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
  public getStatus(): Promise<AppStatus> {
    return this.appService.getStatus();
  }

}
