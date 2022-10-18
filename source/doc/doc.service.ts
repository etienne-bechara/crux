import { Injectable } from '@nestjs/common';
import { OpenAPIObject } from '@nestjs/swagger';

import { AppConfig } from '../app/app.config';
import { AppMemoryKey } from '../app/app.enum';
import { ContextService } from '../context/context.service';
import { MemoryService } from '../memory/memory.service';
import { DocOptions, DocRenderOptions, DocTypography } from './doc.interface';
import { DocModule } from './doc.module';

@Injectable()
export class DocService {

  public constructor(
    private readonly appConfig: AppConfig,
    private readonly contextService: ContextService,
    private readonly memoryService: MemoryService,
  ) { }

  /**
   * Build Redoc page rendering options which isolates
   * necessary data from template and stringify the
   * underlying component params.
   *
   * During the first call to `/docs` endpoint, generate
   * code samples based on current host.
   */
  public buildRenderOptions(): DocRenderOptions {
    const { docs } = this.appConfig.APP_OPTIONS;
    const { disableTryIt, openApiUrl, title, favicon, theme } = docs;

    if (!DocModule.hasServers) {
      this.addContextServer();
    }

    const options: DocOptions = JSON.parse(JSON.stringify(docs));
    delete options.disableTryIt;
    delete options.openApiUrl;
    delete options.version;
    delete options.description;
    delete options.security;
    delete options.tags;
    delete options.theme?.backgroundColor;
    delete options.theme?.scrollbar;
    delete options.codeSamples;

    return {
      disableTryIt,
      openApiUrl,
      title,
      favicon,
      fontsHtml: this.buildFontsHtml(theme?.typography),
      theme,
      options: JSON.stringify(options),
    };
  }

  /**
   * If a server is not provided at document specification,
   * use url of context to build one for code samples.
   */
  private addContextServer(): void {
    const { docs } = this.appConfig.APP_OPTIONS || { };
    const document: OpenAPIObject = this.memoryService.get(AppMemoryKey.OPEN_API_SPECIFICATION);
    const reqProtocol = this.contextService.getRequestProtocol();
    const reqHost = this.contextService.getRequestHost();
    const reqPath = this.contextService.getRequestPath();
    const server = `${reqProtocol}://${reqHost}${reqPath.replace(/\/docs$/, '')}`;

    docs.servers = [ { url: server } ];

    DocModule.generateCodeSamples(document, this.appConfig.APP_OPTIONS);
    DocModule.hasServers = true;
  }

  /**
   * Builds html links to fetch desired fonts remotely.
   * @param typography
   */
  private buildFontsHtml(typography: DocTypography): string {
    const { fontFamily, code, headings } = typography || { };
    const fontIds: string[] = [ ];

    if (fontFamily) {
      fontIds.push(fontFamily.toLowerCase().replace(/\s+/g, '-'));
    }

    if (code?.fontFamily) {
      fontIds.push(code.fontFamily.toLowerCase().replace(/\s+/g, '-'));
    }

    if (headings?.fontFamily) {
      fontIds.push(headings.fontFamily.toLowerCase().replace(/\s+/g, '-'));
    }

    const uniqueIs = [ ...new Set(fontIds) ];
    return uniqueIs.map((f) => `<link href="https://fonts.cdnfonts.com/css/${f}" rel="stylesheet">`).join('\n');
  }

}
