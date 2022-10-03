import { Entity, IsBoolean, IsEmail, IsInt, IsNumberString, IsOptional, IsString, Length, Matches, Min, MinLength, OrmUuidTimestampEntity, Property, Unique } from '@bechara/crux';

import { UserRepository } from './user.repository';

@Entity({ customRepository: () => UserRepository })
@Unique({ properties: [ 'email' ] })
export class User extends OrmUuidTimestampEntity {

  @Property()
  @IsEmail()
  public email: string;

  @Property({ nullable: true })
  @IsOptional()
  @IsString() @MinLength(3)
  public name?: string;

  @Property({ nullable: true })
  @IsOptional()
  @IsInt() @Min(0)
  public age?: number;

  @Property({ nullable: true })
  @IsOptional()
  @IsBoolean()
  public alive?: boolean;

  @Property({ nullable: true })
  @IsOptional()
  @Matches(/(?:\d{3}\.){2}\d{3}-\d{2}/)
  public taxId?: string;

  @Property({ nullable: true })
  @IsOptional()
  @IsNumberString() @Length(10, 11)
  public phone?: string;

}
