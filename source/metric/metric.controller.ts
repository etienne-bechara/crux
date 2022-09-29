import { Controller, Get } from '@nestjs/common';

import { MetricData } from './metric.dto';
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

  @Get('json')
  public getMetricsJson(): Promise<MetricData[]> {
    return this.metricService.readMetricsJson();
  }

}
