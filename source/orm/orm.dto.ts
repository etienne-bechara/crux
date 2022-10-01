import { ApiProperty } from '@nestjs/swagger';

import { ToBoolean, ToNumber, ToStringArray } from '../transform/transform.decorator';
import { IsArray, IsBoolean, IsIn, IsInt, IsNotEmpty, IsOptional, IsString, Max, Min } from '../validate/validate.decorator';
import { OrmQueryOrder } from './orm.enum';

export class OrmPaginationDto {

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
    description: 'Whether or not record count should be calculated, only recommended for first page',
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
  @IsIn(Object.values(OrmQueryOrder))
  @ApiProperty({
    description: 'Order to sort resulting records',
  })
  public order?: OrmQueryOrder;

  @IsOptional()
  @ToStringArray()
  @IsString({ each: true })
  @ApiProperty({
    description: 'Nested entities to expand separated by comma',
  })
  public populate?: string[];

}

export class OrmPagination<Entity> {

  @IsInt() @Min(1) @Max(1000)
  @ApiProperty({
    description: 'Amount of records read',
    example: 100,
  })
  public limit: number;

  @IsInt() @Min(0)
  @ApiProperty({
    description: 'Amount of records skipped',
    example: 0,
  })
  public offset: number;

  @IsOptional()
  @IsInt() @Min(0)
  @ApiProperty({
    description: 'Amount of records available',
    example: 345,
  })
  public count?: number;

  @IsOptional()
  @IsString()
  @ApiProperty({
    description: 'Sorting key of resulting records',
    example: 'id',
  })
  public sort?: string;

  @IsOptional()
  @IsIn(Object.values(OrmQueryOrder))
  @ApiProperty({ description: 'Sorting order of resulting records' })
  public order?: OrmQueryOrder;

  @IsArray()
  @ApiProperty({ description: 'Array of resulting records' })
  public records: Entity[];

}
