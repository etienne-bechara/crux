import { OrmPagination, OrmPaginationDto } from '../../source/orm/orm.dto';
import { IsObject, OmitType, PickType } from '../../source/override';
import { User } from './user.entity';

export class UserIdDto extends PickType(User, [ 'id' ]) { }

export class UserReadDto extends OrmPaginationDto { }

export class UserCreateDto extends OmitType(User, [ 'id', 'originId' ]) { }

export class UserUpdateDto extends PickType(User, [ 'email', 'phone' ]) { }

export class UserPageDto extends OrmPagination<User> {

  @IsObject(User, { each: true })
  public records: User[];

}
