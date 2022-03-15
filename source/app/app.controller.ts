import { HttpStatus } from '@nestjs/common';

import { Controller, Get } from './app.decorator';
import { AppStatus } from './app.dto';
import { AppService } from './app.service';

@Controller('', {
  tags: [ 'Application' ],
})
export class AppController {

  public constructor(
    private readonly appService: AppService,
  ) { }

  @Get({
    operationId: 'Health Check',
    description: 'Checks if application is running.',
    response: { status: HttpStatus.NO_CONTENT },
  })
  public get(): void {
    return;
  }

  @Get('status', {
    operationId: 'Read Status',
    description: 'Acquire information regarding operating system, CPU, memory, and network.',
    response: { type: AppStatus },
  })
  public getStatus(): Promise<AppStatus> {
    return this.appService.getStatus();
  }

}
