import { Type } from 'class-transformer';

import { Contains, IsBoolean, IsDate, IsIn, IsISO8601, IsNotEmpty, IsNumber, IsObject, IsOptional, IsString, Length, Matches, Max, MaxLength, Min, MinLength, ValidateNested } from '../../../source/validator/validator.decorator';

export enum UserStatus {
  ACTIVE = 'ACTIVE',
  BANNED = 'BANNED',
  PENDING = 'PENDING',
}

export class UserAddress {

  @IsString() @Contains('Rua')
  public street: string;

  @IsString() @Length(10, 100)
  public city: string;

  @IsString() @IsNotEmpty()
  public country: string;

  @IsString() @IsNotEmpty()
  public zip: string;

}

export class User {

  @IsNumber()
  public id: number;

  @IsString() @MinLength(5) @MaxLength(50)
  public name: string;

  @IsNumber() @Min(1) @Max(100)
  public age: number;

  @IsBoolean()
  public alive: boolean;

  @Matches(/(?:\d{3}\.){2}\d{3}-\d{2}\./)
  public taxId: string;

  @IsIn(Object.values(UserStatus))
  public status: UserStatus;

  @IsISO8601()
  public birthdate: string;

  @IsOptional()
  @IsDate()
  public created: Date;

  @IsOptional()
  @IsString({ each: true })
  public tags: string[];

  @IsOptional()
  @IsNumber({ }, { each: true })
  public lottery: number[];

  @ValidateNested()
  @Type(() => UserAddress)
  @IsObject()
  public address: UserAddress;

}
