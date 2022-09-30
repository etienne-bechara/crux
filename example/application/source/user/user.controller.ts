import { ApiCreatedResponse, ApiNoContentResponse, ApiOkResponse, ApiOperation, ApiTag, Body, Cache, Controller, Delete, Get, HttpCode, HttpStatus, Param, Patch, Post } from '@bechara/crux';

import { UserCollection, UserCreateDto, UserIdDto, UserUpdateDto } from './user.dto';
import { User } from './user.entity';
import { UserService } from './user.service';

@Controller('user')
@ApiTag({
  name: 'User',
  description: `A user is a person who utilizes a computer or network service.
A user often has a user account and is identified to the system by a username.
Other terms for username include login name, screenname, account name,
nickname and handle, which is derived from the identical citizens band radio term.`,
})
export class UserController {

  public constructor(
    private readonly userService: UserService,
  ) { }

  @Get()
  @ApiOkResponse({ type: UserCollection })
  @ApiOperation({ description: 'Reads the collection of users with pagination support' })
  public getUser(): UserCollection {
    return this.userService.readUsers();
  }

  @Get(':id')
  @ApiOkResponse({ type: User })
  @ApiOperation({ description: 'Reads a single user by its ID' })
  @Cache<User>({
    buckets: ({ req, data }) => [ req.params.id, data.address.zip ],
  })
  public getUserById(@Param() params: UserIdDto): User {
    return this.userService.readUserById(params.id);
  }

  @Post()
  @ApiCreatedResponse({ type: User })
  @ApiOperation({ description: 'Creates a new user' })
  public postUser(@Body() body: UserCreateDto): Promise<User> {
    return this.userService.createUser(body);
  }

  @Patch(':id')
  @ApiOkResponse({ type: User })
  @ApiOperation({ description: 'Partially updates an existing user by its ID' })
  @Cache({
    invalidate: ({ req }) => [ req.params.id ],
  })
  public patchUser(@Param() params: UserIdDto, @Body() body: UserUpdateDto): User {
    return this.userService.updateUserById(params.id, body);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiNoContentResponse()
  @ApiOperation({ description: 'Deletes an user by its ID' })
  @Cache({
    invalidate: ({ req }) => [ req.params.id ],
  })
  public deleteUserById(@Param() params: UserIdDto): void {
    return this.userService.deleteUserById(params.id);
  }

}
