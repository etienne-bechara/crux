import { IsEmail, IsIn, IsNotEmpty, IsNumber, IsNumberString, IsObject, IsOptional, IsString, IsUUID, Length, Matches, Max, Min, MinLength, Type, ValidateNested } from '../../../source/app/app.override';
import { OneOf } from '../../../source/validator/validator.decorator';
import { UserAddressState, UserGender, UserOneOf } from './user.enum';

export class UserAddress {

  @IsNumberString() @Length(5, 8)
  public zip: string;

  @IsString() @IsNotEmpty()
  public number: string;

  @IsOptional()
  @IsString() @IsNotEmpty()
  public details?: string;

  /** Address street, populated through ZIP enrichment. */
  @IsOptional()
  @IsString() @IsNotEmpty()
  public street?: string;

  /** Address district, populated through ZIP enrichment. */
  @IsOptional()
  @IsString() @IsNotEmpty()
  public district?: string;

  /** Address city, populated through ZIP enrichment. */
  @IsOptional()
  @IsString() @IsNotEmpty()
  public city?: string;

  /** Address state, populated through ZIP enrichment. */
  @IsOptional()
  @IsIn(Object.values(UserAddressState))
  public state?: UserAddressState;

}

export class User {

  /** Automatically generated user ID. */
  @IsUUID()
  public id: string;

  /** Request ID which triggered user creation. */
  @IsString()
  public originId: string;

  @IsString() @MinLength(3)
  public name: string;

  @IsString() @MinLength(3)
  public surname: string;

  @Matches(/(?:\d{3}\.){2}\d{3}-\d{2}/)
  public taxId: string;

  @IsIn(Object.values(UserGender))
  public gender: UserGender;

  @OneOf(UserOneOf.USER_AGE_BIRTH_YEAR)
  @IsNumber() @Min(0)
  public age?: number;

  @OneOf(UserOneOf.USER_AGE_BIRTH_YEAR)
  @IsNumber()
  @Min(new Date().getFullYear() - 100)
  @Max(new Date().getFullYear())
  public birthYear?: number;

  @IsOptional()
  @IsEmail()
  public email?: string;

  @IsOptional()
  @IsNumberString() @Length(10, 11)
  public phone?: string;

  @ValidateNested()
  @Type(() => UserAddress)
  @IsObject()
  public address: UserAddress;

}
