import { Controller, Get } from '@nestjs/common';

import { AppStatus } from './app.interface';
import { AppService } from './app.service';

@Controller()
export class AppController {

  public constructor(
    private readonly appService: AppService,
  ) { }

  @Get()
  public get(): Promise<AppStatus> {
    return this.appService.getStatus();
  }

  @Get('status')
  public getStatus(): Promise<AppStatus> {
    return this.appService.getStatus();
  }

}
