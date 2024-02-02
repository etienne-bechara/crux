import { ApiCreatedResponse, ApiNoContentResponse, ApiOkResponse, ApiOperation, ApiTag, Body, Cache, Controller, Delete, Get, HttpCode, HttpStatus, Param, Patch, Post, Query } from '@bechara/crux';

import { UserCollection, UserCreateDto, UserIdDto, UserReadDto, UserUpdateDto } from './user.dto';
import { User } from './user.entity';
import { UserRepository } from './user.repository';

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
    private readonly userRepository: UserRepository,
  ) { }

  @Get()
  @ApiOkResponse({ type: UserCollection })
  @ApiOperation({ description: 'Reads the collection of users with pagination support' })
  public getUser(@Query() query: UserReadDto): Promise<UserCollection> {
    return this.userRepository.readPaginatedBy(query);
  }

  @Get(':id')
  @ApiOkResponse({ type: User })
  @ApiOperation({ description: 'Reads a single user by its ID' })
  @Cache<User>({
    buckets: ({ req }) => [ req.params.id ],
  })
  public getUserById(@Param() params: UserIdDto): Promise<User> {
    return this.userRepository.readById(params.id);
  }

  @Post()
  @ApiCreatedResponse({ type: User })
  @ApiOperation({ description: 'Creates a new user' })
  public postUser(@Body() body: UserCreateDto): Promise<User> {
    return this.userRepository.createOne(body);
  }

  @Patch(':id')
  @ApiOkResponse({ type: User })
  @ApiOperation({ description: 'Partially updates an existing user by its ID' })
  @Cache({
    invalidate: ({ req }) => [ req.params.id ],
  })
  public patchUser(@Param() params: UserIdDto, @Body() body: UserUpdateDto): Promise<User> {
    return this.userRepository.updateById(params.id, body);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiNoContentResponse()
  @ApiOperation({ description: 'Deletes an user by its ID' })
  @Cache({
    invalidate: ({ req }) => [ req.params.id ],
  })
  public async deleteUserById(@Param() params: UserIdDto): Promise<void> {
    await this.userRepository.deleteById(params.id);
  }

}
