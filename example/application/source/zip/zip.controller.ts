import { Cache, Controller, Get, Param } from '@bechara/crux';

import { Zip } from './zip.interface';
import { ZipService } from './zip.service';

@Controller('zip')
export class ZipController {

  public constructor(
    private readonly zipService: ZipService,
  ) { }

  @Cache()
  @Get(':code')
  public getZipCode(@Param('code') code: string): Promise<Zip> {
    return this.zipService.readZip(code);
  }

}
