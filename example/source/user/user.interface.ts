import { ApiProperty } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { IsNotEmpty, IsNumber, IsObject, IsString, Min, ValidateNested } from 'class-validator';

import { ToNumber } from '../../../source/transform/transform.decorator';

export class UserAddressGeo {

  @ApiProperty()
  @IsString() @IsNotEmpty()
  public lat: string;

  @ApiProperty()
  @IsString() @IsNotEmpty()
  public lng: string;

}

export class UserAddress {

  @ApiProperty()
  @IsString() @IsNotEmpty()
  public street: string;

  @ApiProperty()
  @IsString() @IsNotEmpty()
  public suite: string;

  @ApiProperty()
  @IsString() @IsNotEmpty()
  public city: string;

  @ApiProperty()
  @IsString() @IsNotEmpty()
  public zipcode: string;

  @ApiProperty()
  @ValidateNested()
  @Type(() => UserAddressGeo)
  @IsObject()
  public geo: UserAddressGeo;

}

export class UserCompany {

  @ApiProperty()
  @IsString() @IsNotEmpty()
  public name: string;

  @ApiProperty()
  @IsString() @IsNotEmpty()
  public catchPhrase: string;

  @ApiProperty()
  @IsString() @IsNotEmpty()
  public bs: string;

}

export class User {

  @ApiProperty()
  @ToNumber()
  @IsNumber() @Min(1)
  public id: number;

  @ApiProperty()
  @IsString() @IsNotEmpty()
  public name: string;

  @ApiProperty()
  @IsString() @IsNotEmpty()
  public username: string;

  @ApiProperty()
  @IsString() @IsNotEmpty()
  public email: string;

  @ApiProperty()
  @ValidateNested()
  @Type(() => UserAddress)
  @IsObject()
  public address: UserAddress;

  @ApiProperty()
  @IsString() @IsNotEmpty()
  public phone: string;

  @ApiProperty()
  @IsString() @IsNotEmpty()
  public website: string;

  @ApiProperty()
  @ValidateNested()
  @Type(() => UserCompany)
  @IsObject()
  public company: UserCompany;

}
