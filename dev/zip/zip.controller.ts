import { ApiTag } from '../../source/doc/doc.decorator';
import { ApiOkResponse, Controller, Get, Param } from '../../source/override';
import { ZipCodeDto } from './zip.dto';
import { Zip } from './zip.interface';
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
  @ApiOkResponse({ type: Zip })
  public getZipCode(@Param() params: ZipCodeDto): Promise<Zip> {
    return this.zipService.readZip(params.code);
  }

}
