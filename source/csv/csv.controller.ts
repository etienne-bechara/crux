import { Query } from '@nestjs/common';

import { Controller, Get } from '../app/app.decorator';
import { ContextService } from '../context/context.service';
import { CsvReadDto } from './csv.dto';
import { CsvService } from './csv.service';

@Controller('logs', {
  tags: [ 'Application' ],
})
export class CsvController {

  public constructor(
    private readonly contextService: ContextService,
    private readonly csvService: CsvService,
  ) { }

  @Get({
    operationId: 'Read Logs',
    description: 'Download application logs in CSV format.',
    response: { type: Buffer },
  })
  public getLogs(@Query() query: CsvReadDto): Promise<Buffer> {
    const filename = this.csvService.getExpectedFilename();
    const res = this.contextService.getResponse();

    res.header('Content-Type', 'text/csv; charset=UTF-8');
    res.header('Content-Disposition', `attachment; filename=${filename}`);

    return this.csvService.readLogs(query);
  }

}
