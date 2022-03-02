import { Injectable } from '@nestjs/common';

import { HttpService } from '../../../source/http/http.service';
import { UserCreateDto } from './user.dto';
import { User } from './user.interface';

@Injectable()
export class UserService {

  public constructor(
    private readonly httpService: HttpService,
  ) { }

  /**
   * Read all users.
   */
  public readUsers(): Promise<User[]> {
    return this.httpService.get('users');
  }

  /**
   * Read user by ID.
   * @param id
   */
  public readUserById(id: number): Promise<User> {
    return this.httpService.get('users/:id', {
      replacements: { id: id.toString() },
    });
  }

  /**
   * Create user.
   * @param params
   */
  public createUser(params: UserCreateDto): Promise<User> {
    return this.httpService.post('users', {
      json: params,
    });
  }

  /**
   * Replace user.
   * @param params
   */
  public replaceUser(params: User): Promise<User> {
    const { id } = params;
    delete params.id;

    return this.updateUserById(id, params);
  }

  /**
   * Update user by ID.
   * @param id
   * @param params
   */
  public updateUserById(id: number, params: UserCreateDto): Promise<User> {
    return this.httpService.patch('users/:id', {
      replacements: { id: id.toString() },
      json: params,
    });
  }

  /**
   * Delete user by ID.
   * @param id
   */
  public async deleteUserById(id: number): Promise<void> {
    return this.httpService.delete('users/:id', {
      replacements: { id: id.toString() },
    });
  }

}
