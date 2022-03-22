import { Injectable } from '@nestjs/common';

import { AppConfig } from '../app/app.config';
import { DocOptions, DocRenderOptions } from './doc.interface';

@Injectable()
export class DocService {

  public constructor(
    private readonly appConfig: AppConfig,
  ) { }

  /**
   * Build Redoc page rendering options which isolates
   * necessary data from template and stringify the
   * underlying component params.
   */
  public buildRenderOptions(): DocRenderOptions {
    const { docs } = this.appConfig.APP_OPTIONS;
    const options: DocOptions = { ...docs };
    const { title, favicon, openApiUrl } = options;

    delete options.openApiUrl;
    delete options.version;
    delete options.description;

    return { title, favicon, openApiUrl, options: JSON.stringify(options) };
  }

}
