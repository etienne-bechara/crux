import { Param } from '@nestjs/common';

import { Controller, Get } from '../../../source/app/app.decorator';
import { Zip } from './zip.interface';
import { ZipService } from './zip.service';

@Controller('zip')
export class ZipController {

  public constructor(
    private readonly zipService: ZipService,
  ) { }

  @Get(':code')
  public getZipCode(@Param('code') code: string): Promise<Zip> {
    return this.zipService.readZip(code);
  }

}
