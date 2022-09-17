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

  @Get({ schema: UserCollection })
  public getUser(): UserCollection {
    return this.userService.readUsers();
  }

  @Cache<User>({
    buckets: ({ req, data }) => [ req.params.id, data.address.zip ],
  })
  @Get(':id', { schema: User })
  public getUserById(@Param() params: UserIdDto): User {
    return this.userService.readUserById(params.id);
  }

  @Post({ schema: User })
  public postUser(@Body() body: UserCreateDto): Promise<User> {
    return this.userService.createUser(body);
  }

  @Cache({
    invalidate: ({ req }) => [ req.params.id ],
  })
  @Patch(':id', { schema: User })
  public patchUser(@Param() params: UserIdDto, @Body() body: UserUpdateDto): User {
    return this.userService.updateUserById(params.id, body);
  }

  @Cache({
    invalidate: ({ req }) => [ req.params.id ],
  })
  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  public deleteUserById(@Param() params: UserIdDto): void {
    return this.userService.deleteUserById(params.id);
  }

}
