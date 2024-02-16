import { Cache } from '../../source/cache/cache.decorator';
import { ApiTag } from '../../source/doc/doc.decorator';
import { ApiOkResponse, Controller, Get, Param } from '../../source/override';
import { ZipReadDto } from './zip.dto.in';
import { ZipDto } from './zip.dto.out';
import { ZipService } from './zip.service';

@Controller('zip')
@ApiTag({
  name: 'ZIP',
  description: `A ZIP Code a group of five or nine numbers that are added
to a postal address to assist the sorting of mail.`,
})
export class ZipController {

  public constructor(
    private readonly zipService: ZipService,
  ) { }

  @Get(':code')
  @Cache({ ttl: 10_000 })
  @ApiOkResponse({ type: ZipDto })
  public getZipCode(@Param() params: ZipReadDto): Promise<ZipDto> {
    return this.zipService.readZip(params.code);
  }

}
