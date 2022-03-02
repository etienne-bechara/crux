import { OmitType, PartialType, PickType } from '@nestjs/swagger';

import { User } from './user.interface';

export class UserIdDto extends PickType(User, [ 'id' ]) { }

export class UserCreateDto extends OmitType(User, [ 'id' ]) { }

export class UserUpdateDto extends PartialType(OmitType(User, [ 'id' ])) { }
