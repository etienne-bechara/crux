import { Controller, Get } from '@nestjs/common';
import { ApiExcludeEndpoint, ApiProduces } from '@nestjs/swagger';

import { MetricData } from './metric.dto';
import { MetricService } from './metric.service';

@Controller('metrics')
export class MetricController {

  public constructor(
    private readonly metricService: MetricService,
  ) { }

  @Get()
  @ApiProduces('text/plain')
  @ApiExcludeEndpoint()
  public getMetrics(): Promise<string> {
    return this.metricService.readMetrics();
  }

  @Get('json')
  @ApiExcludeEndpoint()
  public getMetricsJson(): Promise<MetricData[]> {
    return this.metricService.readMetricsJson();
  }

}
