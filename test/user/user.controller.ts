import { Body, Controller, Delete, Get, Param, Patch, Post, Put, Query } from '@nestjs/common';

import { UserCreateDto, UserPagination, UserReadDto, UserUpdateDto } from './user.dto';
import { User } from './user.entity';
import { UserRepository } from './user.repository';

@Controller('user')
export class UserController {

  public constructor(
    private readonly userRepository: UserRepository,
  ) { }

  @Get()
  public get(@Query() query: UserReadDto): Promise<UserPagination> {
    return this.userRepository.readPaginatedBy(query);
  }

  @Get(':id')
  public getById(@Param('id') id: string): Promise<User> {
    const populate = [ 'address' ];
    return this.userRepository.readByIdOrFail(id, { populate });
  }

  @Post()
  public post(@Body() body: UserCreateDto): Promise<User> {
    return this.userRepository.createOne(body);
  }

  @Put()
  public put(@Body() body: UserCreateDto): Promise<User> {
    return this.userRepository.upsertOne(body);
  }

  @Put(':id')
  public putById(@Param('id') id: string, @Body() body: UserCreateDto): Promise<User> {
    return this.userRepository.updateById(id, body);
  }

  @Patch(':id')
  public patchById(@Param('id') id: string, @Body() body: UserUpdateDto): Promise<User> {
    return this.userRepository.updateById(id, body);
  }

  @Delete(':id')
  public deleteById(@Param('id') id: string): Promise<User> {
    return this.userRepository.deleteById(id);
  }

}
