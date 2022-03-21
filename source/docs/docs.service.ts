import { Injectable } from '@nestjs/common';

import { AppConfig } from '../app/app.config';
import { DocsOptions, DocsRenderOptions } from './docs.interface';

@Injectable()
export class DocsService {

  public constructor(
    private readonly appConfig: AppConfig,
  ) { }

  /**
   * Build Redoc page rendering options which isolates
   * necessary data from template and stringify the
   * underlying component params.
   */
  public buildRenderOptions(): DocsRenderOptions {
    const { docs } = this.appConfig.APP_OPTIONS;
    const options: DocsOptions = { ...docs };
    const { title, favicon, openApiUrl } = options;

    delete options.openApiUrl;
    delete options.version;
    delete options.description;

    return { title, favicon, openApiUrl, options: JSON.stringify(options) };
  }

}
