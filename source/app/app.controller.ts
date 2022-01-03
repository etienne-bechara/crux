import { Controller, Get } from '@nestjs/common';

import { UtilAppStatus } from '../util/util.interface';
import { UtilService } from '../util/util.service';

@Controller()
export class AppController {

  public constructor(
    private readonly utilService: UtilService,
  ) { }

  @Get()
  public get(): Promise<UtilAppStatus> {
    return this.utilService.getAppStatus();
  }

}
