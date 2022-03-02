
import { Config } from '../config/config.decorator';
import { RedocAppOptions } from './redoc.interface';

@Config()
export class RedocConfig {

  public readonly REDOC_DEFAULT_OPTIONS: RedocAppOptions = {
    title: 'OpenAPI UI',
    favicon: 'https://www.openapis.org/wp-content/uploads/sites/3/2016/11/favicon.png',
    theme: {
      logo: {
        gutter: '25px',
      },
      typography: {
        fontFamily: 'Lato',
        headings: {
          fontFamily: 'Lato',
        },
      },
    },
  };

}
