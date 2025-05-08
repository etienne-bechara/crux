import { PartialType, PickType } from '@nestjs/swagger';

import { OrmPageReadDto } from '../../source/orm/orm.dto.in';
import { OrmPageDto } from '../../source/orm/orm.dto.out';
import { IsObject, IsOptional, IsString } from '../../source/validate/validate.decorator';
import { User } from './user.entity';

export class UserReadDto extends OrmPageReadDto {

  @IsOptional()
  @IsString()
  public name?: string;

}

export class UserCreateDto extends PickType(User, [ 'name', 'age', 'email' ]) { }

export class UserUpdateDto extends PartialType(UserCreateDto) { }

export class UserPagination extends OrmPageDto<User> {

  @IsObject(User, { each: true })
  public records!: User[];

}
