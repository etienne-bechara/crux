import { Cache } from '../../../../source/cache/cache.decorator';
import { Body, Controller, Delete, Get, HttpCode, HttpStatus, Param, Patch, Post } from '../../../../source/override';
import { UserCollection, UserCreateDto, UserIdDto, UserUpdateDto } from './user.dto';
import { User } from './user.entity';
import { UserService } from './user.service';

@Controller('user')
export class UserController {

  public constructor(
    private readonly userService: UserService,
  ) { }

  @Get({ response: { type: UserCollection } })
  public getUser(): UserCollection {
    return this.userService.readUsers();
  }

  @Cache({ buckets: (req) => [ req.params.id ] })
  @Get(':id', { response: { type: User } })
  public getUserById(@Param() params: UserIdDto): User {
    return this.userService.readUserById(params.id);
  }

  @Post({ response: { type: User } })
  public postUser(@Body() body: UserCreateDto): Promise<User> {
    return this.userService.createUser(body);
  }

  @Cache({ invalidate: (req) => [ req.params.id ] })
  @Patch(':id', { response: { type: User } })
  public patchUser(@Param() params: UserIdDto, @Body() body: UserUpdateDto): User {
    return this.userService.updateUserById(params.id, body);
  }

  @Cache({ invalidate: (req) => [ req.params.id ] })
  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  public deleteUserById(@Param() params: UserIdDto): void {
    return this.userService.deleteUserById(params.id);
  }

}
