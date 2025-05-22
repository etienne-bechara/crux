import { OrmPageReadDto } from '../../source/orm/orm.dto.in';
import { PartialType, PickType } from '../../source/override';
import { UserDto } from './user.dto.out';

export class UserIdDto extends PickType(UserDto, ['id']) {}

export class UserReadDto extends OrmPageReadDto {}

export class UserCreateDto extends PickType(UserDto, ['email', 'name', 'age', 'alive', 'taxId', 'phone'] as const) {}

export class UserUpdateDto extends PartialType(UserCreateDto) {}
