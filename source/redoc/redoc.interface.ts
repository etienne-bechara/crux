import { DocumentBuilder } from '@nestjs/swagger';
import { RedocOptions } from 'nestjs-redoc';

export interface RedocRenderOptions {
  title: string;
  favicon: string;
  openApiUrl: string;
  options: string;
}

export interface RedocAppOptions extends RedocOptions {
  documentBuilder?: DocumentBuilder;
  openApiUrl?: string;
  version?: string;
  description?: string;
}
