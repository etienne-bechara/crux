import { OrmUuidTimestampDto } from '../../source/orm/orm.dto.out';
import { IsArray, IsNumber, IsObject, IsString } from '../../source/validate/validate.decorator';
import { MetadataDto } from '../metadata/metadata.dto.out';

export class UserDto extends OrmUuidTimestampDto {
  @IsString()
  public name!: string;

  @IsNumber()
  public age!: number;

  @IsNumber()
  public secret!: number;

  @IsArray()
  @IsObject(MetadataDto, { each: true })
  public metadata!: MetadataDto[];
}
