import { Injectable } from '@nestjs/common';

import { AppConfig } from '../app/app.config';
import { RedocConfig } from './redoc.config';
import { RedocAppOptions, RedocRenderOptions } from './redoc.interface';

@Injectable()
export class RedocService {

  public constructor(
    private readonly appConfig: AppConfig,
    private readonly redocConfig: RedocConfig,
  ) { }

  /**
   * Build Redoc page rendering options which isolates
   * necessary data from template and stringify the
   * underlying component params.
   */
  public buildRenderOptions(): RedocRenderOptions {
    const options = this.buildAppOptions();
    const { title, favicon, openApiUrl } = options;

    delete options.openApiUrl;
    delete options.version;
    delete options.description;

    return { title, favicon, openApiUrl, options: JSON.stringify(options) };
  }

  /**
   * Build Redoc options merging them with application provided.
   */
  public buildAppOptions(): RedocAppOptions {
    const defaultOptions = this.redocConfig.REDOC_DEFAULT_OPTIONS;
    const { redoc: appOptions, port } = this.appConfig.APP_OPTIONS || { };

    defaultOptions.openApiUrl = `http://127.0.0.1:${port}/openapi/json`;

    return { ...defaultOptions, ...appOptions };
  }

}
