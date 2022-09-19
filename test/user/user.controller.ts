import { Body, Param, Query } from '@nestjs/common';

import { Controller, Delete, Get, Patch, Post, Put } from '../../source/app/app.decorator';
import { UserCreateDto, UserPagination, UserReadDto, UserUpdateDto } from './user.dto';
import { User } from './user.entity';
import { UserRepository } from './user.repository';

@Controller('user')
export class UserController {

  public constructor(
    private readonly userRepository: UserRepository,
  ) { }

  @Get({
    schema: UserPagination,
  })
  public get(@Query() query: UserReadDto): Promise<UserPagination> {
    return this.userRepository.readPaginatedBy(query);
  }

  @Get(':id', {
    schema: User,
  })
  public getById(@Param('id') id: string): Promise<User> {
    const populate = [ 'address' ];
    return this.userRepository.readByIdOrFail(id, { populate });
  }

  @Post({
    schema: User,
  })
  public post(@Body() body: UserCreateDto): Promise<User> {
    return this.userRepository.createOne(body);
  }

  @Put({
    schema: User,
  })
  public put(@Body() body: UserCreateDto): Promise<User> {
    return this.userRepository.upsertOne(body);
  }

  @Put(':id', {
    schema: User,
  })
  public putById(@Param('id') id: string, @Body() body: UserCreateDto): Promise<User> {
    return this.userRepository.updateById(id, body);
  }

  @Patch(':id', {
    schema: User,
  })
  public patchById(@Param('id') id: string, @Body() body: UserUpdateDto): Promise<User> {
    return this.userRepository.updateById(id, body);
  }

  @Delete(':id', {
    schema: User,
  })
  public deleteById(@Param('id') id: string): Promise<User> {
    return this.userRepository.deleteById(id);
  }

}
