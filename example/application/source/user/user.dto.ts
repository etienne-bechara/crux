import { ApiProperty, OmitType, OrmPagination, PartialType, PickType, SetType, ValidateNested } from '@bechara/crux';

import { User } from './user.entity';

export class UserIdDto extends PickType(User, [ 'id' ]) { }

export class UserCreateDto extends OmitType(User, [ 'id', 'created', 'updated' ]) { }

export class UserUpdateDto extends PartialType(UserCreateDto) { }

export class UserCollection extends OrmPagination<User> {

  @ApiProperty({ type: [ User ] })
  @ValidateNested({ each: true })
  @SetType(() => User)
  public records: User[];

}
