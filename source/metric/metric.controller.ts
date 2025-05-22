import { Controller, Get } from '@nestjs/common';
import { ApiExcludeController, ApiProduces } from '@nestjs/swagger';

import { MetricDataDto } from './metric.dto.out';
import { MetricService } from './metric.service';

@Controller('metrics')
@ApiExcludeController()
export class MetricController {
  public constructor(private readonly metricService: MetricService) {}

  @Get()
  @ApiProduces('text/plain')
  public getMetrics(): Promise<string> {
    return this.metricService.readMetrics();
  }

  @Get('json')
  public getMetricsJson(): Promise<MetricDataDto[]> {
    return this.metricService.readMetricsJson();
  }
}
