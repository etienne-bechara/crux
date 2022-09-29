import { ApiTags, Body, Cache, Controller, Delete, Get, HttpCode, HttpStatus, Param, Patch, Post } from '@bechara/crux';

import { UserCollection, UserCreateDto, UserIdDto, UserUpdateDto } from './user.dto';
import { User } from './user.entity';
import { UserService } from './user.service';

@ApiTags('user')
@Controller('user')
export class UserController {

  public constructor(
    private readonly userService: UserService,
  ) { }

  @Get()
  public getUser(): UserCollection {
    return this.userService.readUsers();
  }

  @Cache<User>({
    buckets: ({ req, data }) => [ req.params.id, data.address.zip ],
  })
  @Get(':id')
  public getUserById(@Param() params: UserIdDto): User {
    return this.userService.readUserById(params.id);
  }

  @Post()
  public postUser(@Body() body: UserCreateDto): Promise<User> {
    return this.userService.createUser(body);
  }

  @Cache({
    invalidate: ({ req }) => [ req.params.id ],
  })
  @Patch(':id')
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
