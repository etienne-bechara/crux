import { ApiProperty, IsNumber, Min, OmitType, PickType, SetType, ValidateNested } from '../../../source/app/app.override';
import { User } from './user.entity';

export class UserIdDto extends PickType(User, [ 'id' ]) { }

export class UserCreateDto extends OmitType(User, [ 'id', 'originId' ]) { }

export class UserUpdateDto extends PickType(User, [ 'email', 'phone' ]) { }

export class UserCollection {

  @IsNumber() @Min(0)
  public count: number;

  @ApiProperty({ type: [ User ] })
  @ValidateNested({ each: true })
  @SetType(() => User)
  public records: User[];

}
