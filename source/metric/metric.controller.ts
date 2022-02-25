import { Controller, Get } from '@nestjs/common';

import { MetricService } from './metric.service';

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
