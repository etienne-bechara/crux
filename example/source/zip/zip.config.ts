import { Config, InjectSecret } from '../../../source/config/config.decorator';

@Config()
export class ZipConfig {

  @InjectSecret({ fallback: 'https://viacep.com.br/ws' })
  public readonly ZIP_HOST: string;

}
