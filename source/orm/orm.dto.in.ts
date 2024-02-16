import { ApiProperty } from '@nestjs/swagger';

import { ToBoolean, ToNumber, ToStringArray } from '../transform/transform.decorator';
import { IsArray, IsBoolean, IsEnum, IsInt, IsNotEmpty, IsOptional, IsString, Length, Max, Min } from '../validate/validate.decorator';
import { OrmQueryOrder } from './orm.enum';

export class OrmPageReadDto {

  @IsOptional()
  @IsString()
  @Length(32, 32)
  @ApiProperty({
    description: 'Pagination token, mutually exclusive with other pagination properties',
    example: '8d47bdcbde4a7a2d4a98d5f555a19701',
  })
  public token?: string;

  @IsOptional()
  @ToNumber()
  @IsInt() @Min(1) @Max(1000)
  @ApiProperty({
    description: 'Amount of records to read, returns all if available entries are less than specified',
    default: 100,
  })
  public limit?: number;

  @IsOptional()
  @ToNumber()
  @IsInt() @Min(0)
  @ApiProperty({
    description: 'Amount of records to skip, paginate by specifying multipliers of provided limit',
    default: 0,
  })
  public offset?: number;

  @IsOptional()
  @ToBoolean()
  @IsBoolean()
  @ApiProperty({
    description: 'Whether or not record count should be calculated',
    default: false,
  })
  public count?: boolean;

  @IsOptional()
  @IsString() @IsNotEmpty()
  @ApiProperty({
    description: 'Entity key to sort resulting records',
  })
  public sort?: string;

  @IsOptional()
  @IsEnum(OrmQueryOrder)
  @ApiProperty({
    description: 'Order to sort resulting records',
  })
  public order?: OrmQueryOrder;

  @IsOptional()
  @ToStringArray()
  @IsArray()
  @IsString({ each: true })
  @ApiProperty({
    description: 'Nested entities to expand separated by comma',
  })
  public populate?: string[];

}
