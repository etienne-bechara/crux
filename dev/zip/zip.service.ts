import { HttpService, Injectable } from '../../source/override';
import { Span } from '../../source/trace/trace.decorator';
import { ZipDto } from './zip.dto.out';

@Injectable()
export class ZipService {

  public constructor(
    private readonly httpService: HttpService,
  ) { }

  /**
   * Reads target brazilian zip address.
   * @param zip
   */
  @Span()
  public async readZip(zip: string): Promise<ZipDto> {
    const zipDto: ZipDto = await this.httpService.get(':zip/json', {
      replacements: { zip },
    });

    for (const key in zipDto) {
      if (zipDto[key] === '') {
        zipDto[key] = null;
      }
    }

    return zipDto;
  }

}
