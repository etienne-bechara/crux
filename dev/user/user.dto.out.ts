import { ArrayMaxSize, IsArray, IsBoolean, IsEmail, IsEnum, IsInt, IsNumber, IsNumberString, IsObject, IsOptional, IsString, IsUUID, Length, Matches, Max, Min, MinLength } from '../../source/override';
import { ArrayMinSize } from '../../source/validate/validate.decorator';
import { UserAddressState, UserTag } from './user.enum';

export class UserEmployerDto {

  @IsString()
  public name: string;

  @IsNumber()
  public salary: number;

}

export class UserAddressDto {

  @IsNumberString() @Length(5, 8)
  public zip: string;

  @IsString()
  public number: string;

  @IsOptional()
  @IsString()
  public details?: string;

  /** Address street, populated through ZIP enrichment. */
  @IsOptional()
  @IsString()
  public street?: string;

  /** Address district, populated through ZIP enrichment. */
  @IsOptional()
  @IsString()
  public district?: string;

  /** Address city, populated through ZIP enrichment. */
  @IsOptional()
  @IsString()
  public city?: string;

  /** Address state, populated through ZIP enrichment. */
  @IsOptional()
  @IsEnum(UserAddressState)
  public state?: UserAddressState;

}

export class UserDto {

  /** Automatically generated user ID. */
  @IsUUID()
  public id: string;

  /** Request ID which triggered user creation. */
  @IsString()
  public originId: string;

  @IsString() @MinLength(3)
  public name: string;

  @IsInt() @Min(0)
  public age?: number;

  @IsInt()
  @Min(new Date().getFullYear() - 100)
  @Max(new Date().getFullYear())
  public birthYear?: number;

  @IsOptional()
  @IsBoolean()
  public alive?: boolean;

  @IsOptional()
  @IsString() @MinLength(3)
  public surname?: string;

  @IsOptional()
  @Matches(/(?:\d{3}\.){2}\d{3}-\d{2}/)
  public taxId?: string;

  @IsOptional()
  @IsEmail()
  public email?: string;

  @IsOptional()
  @IsNumberString() @Length(10, 11)
  public phone?: string;

  @IsOptional()
  @IsArray()
  @IsEnum(UserTag, { each: true })
  public tags?: UserTag[];

  @IsObject(UserAddressDto)
  public address: UserAddressDto;

  @IsOptional()
  @IsArray()
  @IsObject(UserEmployerDto, { each: true })
  @ArrayMinSize(1) @ArrayMaxSize(5)
  public employers: UserEmployerDto[];

}
