import { Controller, Get } from '@nestjs/common';

import { AppStatus } from './app.dto';
import { AppService } from './app.service';

@Controller()
export class AppController {

  public constructor(
    private readonly appService: AppService,
  ) { }

  @Get()
  public get(): void {
    return;
  }

  @Get('status')
  public getStatus(): AppStatus {
    return this.appService.getStatus();
  }

}
