import { IsBoolean, IsEmail, IsIn, IsInt, IsNotEmpty, IsNumber, IsNumberString, IsObject, IsOptional, IsString, IsUUID, Length, Matches, Max, Min, MinLength, OneOf } from '@bechara/crux';

import { UserAddressState, UserOneOf } from './user.enum';

export class UserEmployer {

  @IsString()
  public name: string;

  @IsNumber()
  public salary: number;

}

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

  @OneOf(UserOneOf.USER_AGE_BIRTH_YEAR)
  @IsInt() @Min(0)
  public age?: number;

  @OneOf(UserOneOf.USER_AGE_BIRTH_YEAR)
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

  @IsObject(UserAddress)
  public address: UserAddress;

  @IsOptional()
  @IsObject(UserEmployer, { each: true })
  public employers: UserEmployer[];

}
