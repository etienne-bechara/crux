import { ApiProperty, OmitType } from '@nestjs/swagger';

import { uuidV4 } from '../override';
import { ToBoolean, ToNumber, ToStringArray } from '../transform/transform.decorator';
import { IsArray, IsBoolean, IsEnum, IsInt, IsISO8601, IsNotEmpty, IsOptional, IsString, IsUUID, Length, Max, Min } from '../validate/validate.decorator';
import { OrmQueryOrder } from './orm.enum';

export class OrmPageReadDto {

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

export class OrmPageTokenReadDto extends OmitType(OrmPageReadDto, [ 'offset' ]) {

  @IsOptional()
  @IsString()
  @Length(32, 32)
  @ApiProperty({
    description: 'Pagination token, when provided ignores further pagination configurations from request',
    example: '8d47bdcbde4a7a2d4a98d5f555a19701',
  })
  public token?: string;

}

export class OrmPageDto<T> {

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
  @IsEnum(OrmQueryOrder)
  @ApiProperty({ description: 'Sorting order of resulting records' })
  public order?: OrmQueryOrder;

  @IsArray()
  @ApiProperty({ description: 'Array of resulting records' })
  public records: T[];

}

export class OrmPageTokenDto<T> extends OrmPageDto<T> {

  @IsString()
  @Length(32, 32)
  @ApiProperty({
    description: 'Next page token',
    example: '8d47bdcbde4a7a2d4a98d5f555a19701',
  })
  public next: string;

  @IsString()
  @Length(32, 32)
  @ApiProperty({
    description: 'Previous page token',
    example: '331e15ea3754b9cdccb7c698bc094795',
  })
  public previous: string;

}

export abstract class OrmIntDto {

  @IsInt()
  @ApiProperty({
    description: 'Unique identifier',
    example: 1,
  })
  public id: number;

}

export abstract class OrmBigIntDto {

  @IsInt()
  @ApiProperty({
    description: 'Unique identifier',
    example: 1,
  })
  public id: number;

}

export abstract class OrmUuidDto {

  @IsUUID()
  @ApiProperty({
    description: 'Unique identifier',
    example: uuidV4(),
  })
  public id: string = uuidV4();

}

export abstract class OrmTimestampDto {

  @IsISO8601()
  @ApiProperty({
    description: 'Date of last update',
    example: new Date().toISOString(),
  })
  public updated: Date = new Date();

  @IsISO8601()
  @ApiProperty({
    description: 'Date of creation',
    example: new Date().toISOString(),
  })
  public created: Date = new Date();

}

export abstract class OrmIntTimestampDto extends OrmTimestampDto {

  @IsInt()
  @ApiProperty({
    description: 'Unique identifier',
    example: 1,
  })
  public id: number;

}

export abstract class OrmBigIntTimestampDto extends OrmTimestampDto {

  @IsInt()
  @ApiProperty({
    description: 'Unique identifier',
    example: 1,
  })
  public id: number;

}

export abstract class OrmUuidTimestampDto extends OrmTimestampDto {

  @IsUUID()
  @ApiProperty({
    description: 'Unique identifier',
    example: uuidV4(),
  })
  public id: string = uuidV4();

}
