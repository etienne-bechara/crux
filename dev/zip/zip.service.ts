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
  public readZip(zip: string): Promise<ZipDto> {
    return this.httpService.get(':zip/json', {
      replacements: { zip },
    });
  }

}
