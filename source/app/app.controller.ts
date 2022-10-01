import { Controller, Get, HttpCode, HttpStatus } from '@nestjs/common';
import { ApiNoContentResponse, ApiOkResponse, ApiOperation } from '@nestjs/swagger';

import { ApiTag } from '../doc/doc.decorator';
import { AppStatus } from './app.dto';
import { AppService } from './app.service';

@Controller()
@ApiTag({ name: 'Status' })
export class AppController {

  public constructor(
    private readonly appService: AppService,
  ) { }

  @Get()
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiNoContentResponse()
  @ApiOperation({
    operationId: 'Health Check',
    description: 'Checks if application is running',
  })
  public get(): void {
    return;
  }

  @Get('status')
  @ApiOkResponse({ type: AppStatus })
  @ApiOperation({
    operationId: 'Read Status',
    description: 'Acquire information regarding operating system, CPU, memory, and network',
  })
  public getStatus(): AppStatus {
    return this.appService.getStatus();
  }

}
