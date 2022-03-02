import { Controller, Get } from '@nestjs/common';
import { ApiExcludeController } from '@nestjs/swagger';

import { MetricService } from './metric.service';

@ApiExcludeController()
@Controller('metrics')
export class MetricController {

  public constructor(
    private readonly metricService: MetricService,
  ) { }

  @Get()
  public getMetrics(): Promise<string> {
    return this.metricService.readMetrics();
  }

}
