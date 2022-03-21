import { Injectable } from '@nestjs/common';

import { AppConfig } from '../app/app.config';
import { DocumentOptions, DocumentRenderOptions } from './document.interface';

@Injectable()
export class DocumentService {

  public constructor(
    private readonly appConfig: AppConfig,
  ) { }

  /**
   * Build Redoc page rendering options which isolates
   * necessary data from template and stringify the
   * underlying component params.
   */
  public buildRenderOptions(): DocumentRenderOptions {
    const { docs } = this.appConfig.APP_OPTIONS;
    const options: DocumentOptions = { ...docs };
    const { title, favicon, openApiUrl } = options;

    delete options.openApiUrl;
    delete options.version;
    delete options.description;

    return { title, favicon, openApiUrl, options: JSON.stringify(options) };
  }

}
