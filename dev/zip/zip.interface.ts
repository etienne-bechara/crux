import { IsIn, IsNumberString, IsString } from '../../source/override';
import { UserAddressState } from '../user/user.enum';

export class Zip {

  @IsNumberString()
  public cep: string;

  @IsString()
  public logradouro: string;

  @IsString()
  public complemento: string;

  @IsString()
  public bairro: string;

  @IsString()
  public localidade: string;

  @IsIn(Object.values(UserAddressState))
  public uf: string;

  @IsNumberString()
  public ibge: string;

  @IsNumberString()
  public gia: string;

  @IsNumberString()
  public ddd: string;

  @IsNumberString()
  public siafi: string;

}
