import { ContextService } from '../../source/context/context.service';
import { Injectable, NotFoundException, uuidV4 } from '../../source/override';
import { Span } from '../../source/trace/trace.decorator';
import { ZipService } from '../zip/zip.service';
import { UserCreateDto, UserPageDto, UserReadDto, UserUpdateDto } from './user.dto.in';
import { UserDto } from './user.dto.out';
import { UserAddressState } from './user.enum';

@Injectable()
export class UserService {

  private readonly USER_DATABASE: UserDto[] = [ ];

  public constructor(
    private readonly contextService: ContextService,
    private readonly zipService: ZipService,
  ) { }

  /**
   * Read all users.
   * @param params
   */
  @Span()
  public readUsers(params?: UserReadDto): UserPageDto {
    const { limit, offset } = params;

    return {
      next: null,
      previous: null,
      limit,
      offset,
      count: this.USER_DATABASE.length,
      records: this.USER_DATABASE,
    };
  }

  /**
   * Read user by ID.
   * @param id
   */
  @Span()
  public readUserById(id: string): UserDto {
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
  public async createUser(params: UserCreateDto): Promise<UserDto> {
    const { age, birthYear, address } = params;
    const { zip } = address;

    const { logradouro, bairro, localidade, uf } = await this.zipService.readZip(zip);

    const user: UserDto = {
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
  public updateUserById(id: string, params: UserUpdateDto): UserDto {
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
