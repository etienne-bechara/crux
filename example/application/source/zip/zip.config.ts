import { Config, InjectConfig } from '@bechara/crux';

@Config()
export class ZipConfig {

  @InjectConfig({ fallback: 'https://viacep.com.br/ws' })
  public readonly ZIP_HOST: string;

}
