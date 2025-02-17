import { ApiProperty } from '@nestjs/swagger';
import { randomUUID } from 'crypto';

import { IsArray, IsEnum, IsInt, IsISO8601, IsOptional, IsString, IsUUID, Length, Max, Min } from '../validate/validate.decorator';
import { OrmQueryOrder } from './orm.enum';

export class OrmPageDto<T> {

  @IsOptional()
  @IsString()
  @Length(32, 32)
  @ApiProperty({
    description: 'Next page token',
    example: '8d47bdcbde4a7a2d4a98d5f555a19701',
  })
  public next?: string | null;

  @IsOptional()
  @IsString()
  @Length(32, 32)
  @ApiProperty({
    description: 'Previous page token',
    example: '331e15ea3754b9cdccb7c698bc094795',
  })
  public previous?: string | null;

  @IsOptional()
  @IsInt() @Min(1) @Max(1000)
  @ApiProperty({
    description: 'Amount of records read',
    example: 100,
  })
  public limit?: number;

  @IsOptional()
  @IsInt() @Min(0)
  @ApiProperty({
    description: 'Amount of records skipped',
    example: 0,
  })
  public offset?: number;

  @IsOptional()
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
  public records!: T[];

}

export class OrmIntDto {

  @IsInt()
  @ApiProperty({
    description: 'Unique identifier',
    example: 1,
  })
  public id!: number;

}

export class OrmBigIntDto {

  @IsInt()
  @ApiProperty({
    description: 'Unique identifier',
    example: 1,
  })
  public id!: number;

}

export class OrmUuidDto {

  @IsUUID()
  @ApiProperty({
    description: 'Unique identifier',
    example: '5680a75e-750e-4c31-a1a1-e61e0e4f5618',
  })
  public id: string = randomUUID();

}

export class OrmTimestampDto {

  @IsISO8601()
  @ApiProperty({
    description: 'Date of last update',
    example: '2024-03-11T17:30:20.757Z',
  })
  public updated!: string;

  @IsISO8601()
  @ApiProperty({
    description: 'Date of creation',
    example: '2024-03-11T17:30:20.757Z',
  })
  public created!: string;

}

export class OrmIntTimestampDto extends OrmTimestampDto {

  @IsInt()
  @ApiProperty({
    description: 'Unique identifier',
    example: 1,
  })
  public id!: number;

}

export class OrmBigIntTimestampDto extends OrmTimestampDto {

  @IsInt()
  @ApiProperty({
    description: 'Unique identifier',
    example: 1,
  })
  public id!: number;

}

export class OrmUuidTimestampDto extends OrmTimestampDto {

  @IsUUID()
  @ApiProperty({
    description: 'Unique identifier',
    example: '5680a75e-750e-4c31-a1a1-e61e0e4f5618',
  })
  public id: string = randomUUID();

}
