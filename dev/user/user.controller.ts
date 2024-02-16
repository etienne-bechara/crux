import { Cache } from '../../source/cache/cache.decorator';
import { ApiTag } from '../../source/doc/doc.decorator';
import { ApiCreatedResponse, ApiNoContentResponse, ApiOkResponse, ApiOperation, ApiSecurity, Body, Controller, Delete, Get, HttpCode, HttpStatus, Param, Patch, Post, Query, Response } from '../../source/override';
import { UserCreateDto, UserIdDto, UserPageDto, UserReadDto, UserUpdateDto } from './user.dto.in';
import { UserDto } from './user.dto.out';
import { UserService } from './user.service';

@Controller('user')
@ApiSecurity('API Key')
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
  @Response(UserPageDto)
  @ApiOkResponse({ type: UserPageDto })
  @ApiOperation({ description: 'Reads the collection of users with pagination support' })
  public getUser(@Query() query: UserReadDto): UserPageDto {
    return this.userService.readUsers(query);
  }

  @Get(':id')
  @ApiOkResponse({ type: UserDto })
  @ApiOperation({ description: 'Reads a single user by its ID' })
  @Cache<UserDto>({
    buckets: ({ req, data }) => [ req.params.id, data.address.zip ],
  })
  public getUserById(@Param() params: UserIdDto): UserDto {
    return this.userService.readUserById(params.id);
  }

  @Post()
  @ApiCreatedResponse({ type: UserDto })
  @ApiOperation({ description: 'Creates a new user' })
  public postUser(@Body() body: UserCreateDto): Promise<UserDto> {
    return this.userService.createUser(body);
  }

  @Patch(':id')
  @ApiOkResponse({ type: UserDto })
  @ApiOperation({ description: 'Partially updates an existing user by its ID' })
  @Cache({
    invalidate: ({ req }) => [ req.params.id ],
  })
  public patchUser(@Param() params: UserIdDto, @Body() body: UserUpdateDto): UserDto {
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
