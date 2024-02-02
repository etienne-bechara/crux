import { ApiProperty, OrmPageDto, OrmPageReadDto, PartialType, PickType, SetType, ValidateNested } from '@bechara/crux';

import { User } from './user.entity';

export class UserIdDto extends PickType(User, [ 'id' ]) { }

export class UserReadDto extends OrmPageReadDto { }

export class UserCreateDto extends PickType(User, [
  'email', 'name', 'age', 'alive', 'taxId', 'phone',
] as const) { }

export class UserUpdateDto extends PartialType(UserCreateDto) { }

export class UserCollection extends OrmPageDto<User> {

  @ApiProperty({ type: [ User ] })
  @ValidateNested({ each: true })
  @SetType(() => User)
  public records: User[];

}
