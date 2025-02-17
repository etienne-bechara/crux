import { Config, InjectConfig } from '../../source/config/config.decorator';

@Config()
export class ZipConfig {

  @InjectConfig({ fallback: 'https://viacep.com.br/ws' })
  public readonly ZIP_HOST!: string;

}
