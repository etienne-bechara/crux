import { Body, Controller, Delete, Get, Param, Patch, Post, Put } from '@nestjs/common';
import { ApiCreatedResponse, ApiNoContentResponse, ApiOkResponse, ApiTags } from '@nestjs/swagger';

import { UserCreateDto, UserIdDto } from './user.dto';
import { User } from './user.interface';
import { UserService } from './user.service';

@ApiTags('User')
@Controller('user')
export class UserController {

  public constructor(
    private readonly userService: UserService,
  ) { }

  @Get()
  @ApiOkResponse({ type: [ User ] })
  public getUser(): Promise<User[]> {
    return this.userService.readUsers();
  }

  @Get(':id')
  @ApiOkResponse({ type: User })
  public getUserById(@Param() params: UserIdDto): Promise<User> {
    const { id } = params;
    return this.userService.readUserById(id);
  }

  @Post()
  @ApiCreatedResponse({ type: User })
  public postUser(@Body() body: UserCreateDto): Promise<User> {
    return this.userService.createUser(body);
  }

  @Put()
  @ApiOkResponse({ type: User })
  public putUser(@Body() body: User): Promise<User> {
    return this.userService.replaceUser(body);
  }

  @Patch(':id')
  @ApiOkResponse({ type: User })
  public patchUserById(@Param() params: UserIdDto, @Body() body: UserCreateDto): Promise<User> {
    const { id } = params;
    return this.userService.updateUserById(id, body);
  }

  @Delete(':id')
  @ApiNoContentResponse()
  public deleteUserById(@Param() params: UserIdDto): Promise<void> {
    const { id } = params;
    return this.userService.deleteUserById(id);
  }

}
