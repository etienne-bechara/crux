/* eslint-disable @typescript-eslint/naming-convention */
import { ExternalDocumentationObject, SecuritySchemeObject } from '@nestjs/swagger/dist/interfaces/open-api-spec.interface';

export interface DocSecurity {
  name: string;
  options: SecuritySchemeObject;
}

export interface DocServer {
  url: string;
  description?: string;
}

export interface DogLogo {
  url?: string;
  backgroundColor?: string;
  altText?: string;
  href?: string;
}

export interface DocTag {
  name: string;
  description?: string;
  externalDocs?: ExternalDocumentationObject;
}

export interface DocTagGroup {
  name: string;
  tags: string[];
}

export interface DocOptions {
  title?: string;
  version?: string;
  description?: string;
  favicon?: string;
  servers?: DocServer[];
  security?: DocSecurity[];
  tags?: DocTag[];
  tagGroups?: DocTagGroup[];
}
