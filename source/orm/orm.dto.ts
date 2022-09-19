import { ToBoolean, ToNumber, ToStringArray } from '../transform/transform.decorator';
import { IsArray, IsBoolean, IsDefined, IsIn, IsInt, IsNumber, IsOptional, IsString, Max, Min } from '../validate/validate.decorator';
import { OrmQueryOrder } from './orm.enum';

export class OrmPaginationDto {

  @IsOptional()
  @ToNumber()
  @IsNumber() @Min(1) @Max(1000)
  public limit?: number;

  @IsOptional()
  @ToNumber()
  @IsNumber() @Min(0)
  public offset?: number;

  @IsOptional()
  @ToBoolean()
  @IsBoolean()
  public count?: boolean;

  @IsOptional()
  @IsString() @IsDefined()
  public sort?: string;

  @IsOptional()
  @IsIn(Object.values(OrmQueryOrder))
  public order?: OrmQueryOrder;

  @IsOptional()
  @ToStringArray()
  @IsString({ each: true })
  public populate?: string[];

}

export class OrmPagination<Entity> {

  @IsInt()
  public limit: number;

  @IsInt()
  public offset: number;

  @IsOptional()
  @IsInt()
  public count?: number;

  @IsOptional()
  @IsString()
  public sort?: string;

  @IsOptional()
  @IsIn(Object.values(OrmQueryOrder))
  public order?: OrmQueryOrder;

  @IsArray()
  public records: Entity[];

}
