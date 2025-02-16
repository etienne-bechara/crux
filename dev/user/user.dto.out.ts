import { OrmPageDto, OrmUuidTimestampDto } from '../../source/orm/orm.dto.out';
import { IsBoolean, IsEmail, IsInt, IsNumberString, IsObject, IsOptional, IsString, Length, Matches, Min, MinLength } from '../../source/override';

export class UserDto extends OrmUuidTimestampDto {

  @IsEmail()
  public email: string;

  @IsOptional()
  @IsString() @MinLength(3)
  public name?: string;

  @IsOptional()
  @IsInt() @Min(0)
  public age?: number;

  @IsOptional()
  @IsBoolean()
  public alive?: boolean;

  @IsOptional()
  @Matches(/(?:\d{3}\.){2}\d{3}-\d{2}/)
  public taxId?: string;

  @IsOptional()
  @IsNumberString() @Length(10, 11)
  public phone?: string;

}

export class UserPageDto extends OrmPageDto<UserDto> {

  @IsObject(UserDto, { each: true })
  public declare records: UserDto[];

}
