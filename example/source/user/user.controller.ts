import { Body, Param } from '@nestjs/common';

import { Controller, Delete, Get, Patch, Post, Put } from '../../../source/app/app.decorator';
import { UserCreateDto, UserIdDto } from './user.dto';
import { User } from './user.entity';
import { UserService } from './user.service';

@Controller('user')
export class UserController {

  public constructor(
    private readonly userService: UserService,
  ) { }

  @Get({ type: [ User ] })
  public getUser(): Promise<User[]> {
    return this.userService.readUsers();
  }

  @Get(':id', { type: User })
  public getUserById(@Param() params: UserIdDto): Promise<User> {
    const { id } = params;
    return this.userService.readUserById(id);
  }

  @Post({ type: User })
  public postUser(@Body() body: UserCreateDto): Promise<User> {
    return this.userService.createUser(body);
  }

  @Put({ type: User })
  public putUser(@Body() body: User): Promise<User> {
    return this.userService.replaceUser(body);
  }

  @Patch(':id', { type: User })
  public patchUserById(@Param() params: UserIdDto, @Body() body: UserCreateDto): Promise<User> {
    const { id } = params;
    return this.userService.updateUserById(id, body);
  }

  @Delete(':id')
  public deleteUserById(@Param() params: UserIdDto): Promise<void> {
    const { id } = params;
    return this.userService.deleteUserById(id);
  }

}
