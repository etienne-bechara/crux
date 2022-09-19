import { Controller, Get } from '../../../../source/app/app.decorator';
import { Cache } from '../../../../source/cache/cache.decorator';
import { Param } from '../../../../source/override';
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
