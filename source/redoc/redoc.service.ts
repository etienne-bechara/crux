import { Injectable } from '@nestjs/common';

import { AppConfig } from '../app/app.config';
import { RedocAppOptions, RedocRenderOptions } from './redoc.interface';

@Injectable()
export class RedocService {

  public constructor(
    private readonly appConfig: AppConfig,
  ) { }

  /**
   * Build Redoc page rendering options which isolates
   * necessary data from template and stringify the
   * underlying component params.
   */
  public buildRenderOptions(): RedocRenderOptions {
    const { redoc } = this.appConfig.APP_OPTIONS;
    const options: RedocAppOptions = { ...redoc };
    const { title, favicon, openApiUrl } = options;

    delete options.openApiUrl;
    delete options.version;
    delete options.description;

    return { title, favicon, openApiUrl, options: JSON.stringify(options) };
  }

}
