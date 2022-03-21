import { DocumentBuilder } from '@nestjs/swagger';
import { RedocOptions } from 'nestjs-redoc';

export interface DocsRenderOptions {
  title: string;
  favicon: string;
  openApiUrl: string;
  options: string;
}

export interface DocsOptions extends RedocOptions {
  documentBuilder?: DocumentBuilder;
  openApiUrl?: string;
  version?: string;
  description?: string;
}
