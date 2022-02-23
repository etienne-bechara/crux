import { Controller, Get } from '@nestjs/common';

import { MetricService } from './metric.service';

@Controller('metric')
export class MetricController {

  public constructor(
    private readonly metricService: MetricService,
  ) { }

  @Get()
  public getMetric(): Promise<string> {
    return this.metricService.readMetrics();
  }

}
