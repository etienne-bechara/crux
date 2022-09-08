import { Param } from '@nestjs/common';

import { Controller, Get } from '../../../source/app/app.decorator';
import { Cache } from '../../../source/cache/cache.decorator';
import { Zip } from './zip.interface';
import { ZipService } from './zip.service';

@Controller('zip')
export class ZipController {

  public constructor(
    private readonly zipService: ZipService,
  ) { }

  @Get(':code')
  @Cache({ ttl: 10_000 })
  public getZipCode(@Param('code') code: string): Promise<Zip> {
    return this.zipService.readZip(code);
  }

}
