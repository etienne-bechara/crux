import { Controller, Get } from '@nestjs/common';

import { UtilAppStatus } from './util.interface';
import { UtilService } from './util.service';

@Controller('util')
export class UtilController {

  public constructor(private readonly utilService: UtilService) { }

  @Get('status')
  public getUtilStatus(): Promise<UtilAppStatus> {
    return this.utilService.getAppStatus();
  }

}
