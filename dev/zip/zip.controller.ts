import { Cache } from '../../source/cache/cache.decorator';
import { ApiTag } from '../../source/doc/doc.decorator';
import { ApiOkResponse, Controller, Get, Param } from '../../source/override';
import { Zip } from './zip.interface';
import { ZipService } from './zip.service';

@Controller('zip')
@ApiTag({
	name: 'ZIP',
	description: `A ZIP Code a group of five or nine numbers that are added
to a postal address to assist the sorting of mail.`,
})
export class ZipController {
	public constructor(private readonly zipService: ZipService) {}

	@Get(':code')
	@Cache({ ttl: 10_000 })
	@ApiOkResponse({ type: Zip })
	public getZipCode(@Param('code') code: string): Promise<Zip> {
		return this.zipService.readZip(code);
	}
}
