import { DocumentBuilder } from '@nestjs/swagger';
import { RedocOptions } from 'nestjs-redoc';

export interface DocRenderOptions {
  title: string;
  favicon: string;
  openApiUrl: string;
  options: string;
}

export interface DocOptions extends RedocOptions {
  documentBuilder?: DocumentBuilder;
  openApiUrl?: string;
  version?: string;
  description?: string;
}