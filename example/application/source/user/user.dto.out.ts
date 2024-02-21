import { IsObject, OrmPageDto, OrmPageReadDto, PartialType, PickType } from '@bechara/crux';

import { UserDto } from './user.dto.in';

export class UserIdDto extends PickType(UserDto, [ 'id' ]) { }

export class UserReadDto extends OrmPageReadDto { }

export class UserCreateDto extends PickType(UserDto, [
  'email', 'name', 'age', 'alive', 'taxId', 'phone',
] as const) { }

export class UserUpdateDto extends PartialType(UserCreateDto) { }

export class UserPageDto extends OrmPageDto<UserDto> {

  @IsObject(UserDto, { each: true })
  public records: UserDto[];

}
