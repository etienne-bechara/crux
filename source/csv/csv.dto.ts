import { ApiProperty } from '@nestjs/swagger';
import { IsNumber, Min } from 'class-validator';

import { ToNumber } from '../transform/transform.decorator';
import { IsOptional } from '../validator/validator.decorator';

export class CsvReadDto {

  @ApiProperty({
    description: 'Amount of past hours to download log data.',
    default: 8,
  })
  @IsOptional()
  @ToNumber()
  @IsNumber() @Min(1)
  public hours?: number;

}
