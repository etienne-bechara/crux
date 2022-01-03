import { Controller, Get } from '@nestjs/common';

import { UtilAppStatus } from './util.interface';
import { UtilService } from './util.service';

@Controller('status')
export class UtilStatusController {

  public constructor(
    private readonly utilService: UtilService,
  ) { }

  @Get()
  public getUtilStatus(): Promise<UtilAppStatus> {
    return this.utilService.getAppStatus();
  }

}
