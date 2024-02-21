import { IsBoolean, IsEmail, IsInt, IsNumberString, IsOptional, IsString, Length, Matches, Min, MinLength, OrmUuidTimestampDto } from '@bechara/crux';

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
