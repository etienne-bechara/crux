import { OrmPageReadDto } from '../../source/orm/orm.dto.in';
import { OrmPageDto } from '../../source/orm/orm.dto.out';
import { IsObject, OmitType, PickType } from '../../source/override';
import { OneOf } from '../../source/validate/validate.decorator';
import { UserDto } from './user.dto.out';
import { UserOneOf } from './user.enum';

export class UserIdDto extends PickType(UserDto, [ 'id' ]) { }

export class UserReadDto extends OrmPageReadDto { }

export class UserCreateDto extends OmitType(UserDto, [ 'id', 'originId' ]) {

  @OneOf(UserOneOf.USER_AGE_BIRTH_YEAR)
  public age: number;

  @OneOf(UserOneOf.USER_AGE_BIRTH_YEAR)
  public birthYear?: number;

}

export class UserUpdateDto extends PickType(UserDto, [ 'email', 'phone' ]) { }

export class UserPageDto extends OrmPageDto<UserDto> {

  @IsObject(UserDto, { each: true })
  public records: UserDto[];

}
