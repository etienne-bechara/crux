import { ApiProperty } from '@nestjs/swagger';
import { IsNumber, IsString, Min, MinLength } from 'class-validator';

import { ToNumber } from '../transform/transform.decorator';
import { IsOptional } from '../validator/validator.decorator';

export class CsvReadDto {

  @ApiProperty({
    description: 'Amount of past hours to scan log data.',
    default: 8,
  })
  @IsOptional()
  @ToNumber()
  @IsNumber() @Min(1)
  public hours?: number;

  @ApiProperty({
    description: 'Keyword to filter log records.',
  })
  @IsOptional()
  @IsString() @MinLength(3)
  public keyword?: string;

}
