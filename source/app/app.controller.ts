import { HttpStatus } from '@nestjs/common';

import { Controller, Get } from './app.decorator';
import { AppStatus } from './app.dto';
import { AppService } from './app.service';

@Controller('', {
  tags: [ 'Status' ],
})
export class AppController {

  public constructor(
    private readonly appService: AppService,
  ) { }

  @Get({
    title: 'Health Check',
    description: 'Checks if application is running.',
    status: HttpStatus.NO_CONTENT,
  })
  public get(): void {
    return;
  }

  @Get('status', {
    title: 'Read Status',
    description: 'Acquire information regarding operating system, CPU, memory, and network.',
    schema: AppStatus,
  })
  public getStatus(): Promise<AppStatus> {
    return this.appService.getStatus();
  }

}
