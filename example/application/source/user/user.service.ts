import { ContextService, Injectable, NotFoundException, Span, uuidV4 } from '@bechara/crux';

import { ZipService } from '../zip/zip.service';
import { UserCollection, UserCreateDto, UserUpdateDto } from './user.dto';
import { User } from './user.entity';
import { UserAddressState } from './user.enum';

@Injectable()
export class UserService {

  private readonly USER_DATABASE: User[] = [ ];

  public constructor(
    private readonly contextService: ContextService,
    private readonly zipService: ZipService,
  ) { }

  /**
   * Read all users.
   */
  @Span()
  public readUsers(): UserCollection {
    return {
      count: this.USER_DATABASE.length,
      records: this.USER_DATABASE,
    };
  }

  /**
   * Read user by ID.
   * @param id
   */
  @Span()
  public readUserById(id: string): User {
    const user = this.USER_DATABASE.find((u) => u.id === id);

    if (!user) {
      throw new NotFoundException('user does not exist');
    }

    return user;
  }

  /**
   * Create user.
   * @param params
   */
  @Span()
  public async createUser(params: UserCreateDto): Promise<User> {
    const { age, birthYear, address } = params;
    const { zip } = address;

    const { logradouro, bairro, localidade, uf } = await this.zipService.readZip(zip);

    const user: User = {
      id: uuidV4(),
      originId: this.contextService.getRequestId(),
      // Age and birth year are mutually exclusive, calculate the other based on the existing
      // This logic is poor and just for example purposes, it has a +-1 error due to not knowing day of birth
      age: age ?? new Date().getFullYear() - birthYear,
      birthYear: birthYear ?? new Date().getFullYear() - age,
      ...params,
      address: {
        street: logradouro,
        district: bairro,
        city: localidade,
        state: uf as UserAddressState,
        ...address,
      },
    };

    this.USER_DATABASE.push(user);

    return user;
  }

  /**
   * Update user by id.
   * @param id
   * @param params
   */
  @Span()
  public updateUserById(id: string, params: UserUpdateDto): User {
    const user = this.readUserById(id);

    for (const key in params) {
      user[key] = params[key];
    }

    return user;
  }

  /**
   * Delete user by id.
   * @param id
   */
  @Span()
  public deleteUserById(id: string): void {
    const index = this.USER_DATABASE.findIndex((u) => u.id === id);

    if (index === -1) {
      throw new NotFoundException('user does not exist');
    }

    this.USER_DATABASE.splice(index, 1);
  }

}
