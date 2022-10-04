/* eslint-disable @typescript-eslint/naming-convention */
import { DocumentBuilder } from '@nestjs/swagger';
import { ExternalDocumentationObject, SecuritySchemeObject } from '@nestjs/swagger/dist/interfaces/open-api-spec.interface';
import { RedocOptions } from 'nestjs-redoc';

import { DocCodeSampleClient } from './doc.enum';

export interface DocRenderOptions {
  disableTryIt: boolean;
  title: string;
  favicon: string;
  openApiUrl: string;
  options: string;
  backgroundColor: string;
  scrollbar: DocThemeScrollbar;
}

export interface DocTag {
  name: string;
  description?: string;
  externalDocs?: ExternalDocumentationObject;
}

export interface DocSecurity {
  name: string;
  options: SecuritySchemeObject;
}

export interface DocCodeSample {
  label: string;
  client: DocCodeSampleClient;
}

export interface DocOptions extends RedocOptions {
  disableTryIt?: boolean;
  documentBuilder?: DocumentBuilder;
  openApiUrl?: string;
  version?: string;
  description?: string;
  security?: DocSecurity[];
  theme?: DocTheme;
  codeSamples?: DocCodeSample[];
}

export interface DocThemeColors {
  main?: string;
  light?: string;
  dark?: string;
  contrastText?: string;
}

export interface DocHttpResponseColors {
  color?: string;
  backgroundColor?: string;
  tabTextColor?: string;
}

export interface DocFontSettings {
  fontSize?: string;
  fontWeight?: string;
  fontFamily?: string;
  lineHeight?: string;
  color?: string;
}

export interface DocServers {
  overlay?: {
    backgroundColor?: string;
    textColor?: string;
  };
  url?: {
    backgroundColor?: string;
  };
}

export interface DocThemeScrollbar {
  width?: string;
  thumbColor?: string;
  trackColor?: string;
}

export interface DocTheme extends DocBaseTheme {
  backgroundColor?: string;
  scrollbar?: DocThemeScrollbar;
}

/**
 * Base ReDoc theme options
 * https://github.com/Redocly/redoc/blob/main/src/theme.ts.
 */
export interface DocBaseTheme {
  spacing?: {
    unit?: number;
    sectionHorizontal?: number;
    sectionVertical?: number;
  };
  breakpoints?: {
    small?: string;
    medium?: string;
    large?: string;
  };
  colors?: {
    tonalOffset?: number;
    primary?: DocThemeColors;
    success?: DocThemeColors;
    warning?: DocThemeColors;
    error?: DocThemeColors;
    gray?: {
      '50'?: string;
      '100'?: string;
    };
    border?: {
      light?: string;
      dark?: string;
    };
    text?: {
      primary?: string;
      secondary?: string;
    };
    responses?: {
      success?: DocHttpResponseColors;
      error?: DocHttpResponseColors;
      redirect?: DocHttpResponseColors;
      info?: DocHttpResponseColors;
    };
    http?: {
      get?: string;
      post?: string;
      put?: string;
      options?: string;
      patch?: string;
      delete?: string;
      basic?: string;
      link?: string;
      head?: string;
    };
  };
  schema?: {
    linesColor?: string;
    defaultDetailsWidth?: string;
    typeNameColor?: string;
    typeTitleColor?: string;
    requireLabelColor?: string;
    labelsTextSize?: string;
    nestingSpacing?: string;
    nestedBackground?: string;
    arrow?: {
      size?: string;
      color?: string;
    };
  };
  typography?: {
    fontSize?: string;
    lineHeight?: string;
    fontWeightLight?: string;
    fontWeightRegular?: string;
    fontWeightBold?: string;
    fontFamily?: string;
    smoothing?: string;
    optimizeSpeed?: boolean;
    code?: DocFontSettings & {
      backgroundColor?: string;
      wrap?: boolean;
    };
    headings?: {
      fontFamily?: string;
      fontWeight?: string;
      lineHeight?: string;
    };
    links?: {
      color?: string;
      visited?: string;
      hover?: string;
      textDecoration?: string;
      hoverTextDecoration?: string;
    };
  };
  sidebar?: {
    width?: string;
    backgroundColor?: string;
    textColor?: string;
    activeTextColor?: string;
    groupItems?: {
      activeBackgroundColor?: string;
      activeTextColor?: string;
      textTransform?: string;
    };
    level1Items?: {
      activeBackgroundColor?: string;
      activeTextColor?: string;
      textTransform?: string;
    };
    arrow?: {
      size?: string;
      color?: string;
    };
  };
  logo?: {
    maxHeight?: string;
    maxWidth?: string;
    gutter?: string;
  };
  rightPanel?: {
    backgroundColor?: string;
    textColor?: string;
    width?: string;
    servers?: DocServers;
  };
  codeBlock?: {
    backgroundColor?: string;
  };
  fab?: {
    backgroundColor?: string;
    color?: string;
  };
  extensionsHook?: (name: string, props: any) => string;
}
