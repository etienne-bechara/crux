import { IsEnum, IsNumberString, IsString } from '../../source/override';
import { ZipState } from './zip.enum';

export class Zip {
  @IsNumberString()
  public cep!: string;

  @IsString()
  public logradouro!: string;

  @IsString()
  public complemento!: string;

  @IsString()
  public bairro!: string;

  @IsString()
  public localidade!: string;

  @IsEnum(ZipState)
  public uf!: string;

  @IsNumberString()
  public ibge!: string;

  @IsNumberString()
  public gia!: string;

  @IsNumberString()
  public ddd!: string;

  @IsNumberString()
  public siafi!: string;
}
