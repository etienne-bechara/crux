import { Type } from 'class-transformer';
import { IsNotEmpty, IsObject, Min, ValidateNested } from 'class-validator';

import { ToNumber } from '../../../source/transform/transform.decorator';
import { IsNumber, IsString } from '../../../source/validator/validator.decorator';

export class UserAddressGeo {

  @IsString() @IsNotEmpty()
  public lat: string;

  @IsString() @IsNotEmpty()
  public lng: string;

}

export class UserAddress {

  @IsString() @IsNotEmpty()
  public street: string;

  @IsString() @IsNotEmpty()
  public suite: string;

  @IsString() @IsNotEmpty()
  public city: string;

  @IsString() @IsNotEmpty()
  public zipcode: string;

  @ValidateNested()
  @Type(() => UserAddressGeo)
  @IsObject()
  public geo: UserAddressGeo;

}

export class UserCompany {

  @IsString() @IsNotEmpty()
  public name: string;

  @IsString() @IsNotEmpty()
  public catchPhrase: string;

  @IsString() @IsNotEmpty()
  public bs: string;

}

export class User {

  @ToNumber()
  @IsNumber() @Min(1)
  public id: number;

  @IsString() @IsNotEmpty()
  public name: string;

  @IsString() @IsNotEmpty()
  public username: string;

  @IsString() @IsNotEmpty()
  public email: string;

  @ValidateNested()
  @Type(() => UserAddress)
  @IsObject()
  public address: UserAddress;

  @IsString() @IsNotEmpty()
  public phone: string;

  @IsString() @IsNotEmpty()
  public website: string;

  @ValidateNested()
  @Type(() => UserCompany)
  @IsObject()
  public company: UserCompany;

}
