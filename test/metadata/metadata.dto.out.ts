import { IsString } from '../../source/validate/validate.decorator';

export class MetadataDto {

  @IsString()
  public id!: string;

  @IsString()
  public key!: string;

  @IsString()
  public value!: string;

  @IsString()
  public kv!: string;

}