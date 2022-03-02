
import { Config } from '../config/config.decorator';
import { RedocAppOptions } from './redoc.interface';

@Config()
export class RedocConfig {

  public readonly REDOC_DEFAULT_OPTIONS: RedocAppOptions = {
    title: 'OpenAPI UI',
    favicon: 'https://www.openapis.org/wp-content/uploads/sites/3/2016/11/favicon.png',
    logo: {
      url: 'https://www.openapis.org/wp-content/uploads/sites/3/2016/10/OpenAPI_Pantone.png',
    },
    description: 'This API documentation is automatically generated based on `@nestjs/swagger` decorators.\n\n'
      + 'For further instructions on how to annotated your models and endpoints check '
      + '[NestJS - OpenAPI Introduction](https://docs.nestjs.com/openapi/introduction).\n\n'
      + 'To customize logo, title, description and other layout options, add the `redoc` property '
      + 'during application initialization:\n\n```\nvoid AppModule.boot({\n  redoc: { }\n});\n```',
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
