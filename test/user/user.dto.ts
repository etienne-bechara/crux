import { PartialType, PickType } from '@nestjs/swagger';

import { OrmPagination, OrmPaginationDto } from '../../source/orm/orm.dto';
import { IsObject, IsOptional, IsString } from '../../source/validate/validate.decorator';
import { User } from './user.entity';

export class UserReadDto extends OrmPaginationDto {

  @IsOptional()
  @IsString()
  public name?: string;

}

export class UserCreateDto extends PickType(User, [ 'name', 'age', 'email' ]) { }

export class UserUpdateDto extends PartialType(UserCreateDto) { }

export class UserPagination extends OrmPagination<User> {

  @IsObject(User, { each: true })
  public records: User[];

}
