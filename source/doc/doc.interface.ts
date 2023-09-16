/* eslint-disable @typescript-eslint/naming-convention */
import { ExternalDocumentationObject, OpenAPIObject, SecuritySchemeObject } from '@nestjs/swagger/dist/interfaces/open-api-spec.interface';

export interface DocHttpSnippetParams {
  document: OpenAPIObject;
  servers: DocServer[];
  security: DocSecurity[];
  path: string;
  method: string;
}

export interface DocRenderOptions {
  disableTryIt: boolean;
  title: string;
  favicon: string;
  fontsHtml: string;
  openApiUrl: string;
  options: string;
  theme: DocTheme;
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

export interface DocServer {
  url: string;
  description?: string;
}

export interface DocRedocOptions {
  redocVersion?: string;
  title?: string;
  favicon?: string;
  logo?: DogLogo;
  theme?: any;
  untrustedSpec?: boolean;
  supressWarnings?: boolean;
  hideHostname?: boolean;
  expandResponses?: string;
  requiredPropsFirst?: boolean;
  sortPropsAlphabetically?: boolean;
  showExtensions?: boolean | string;
  noAutoAuth?: boolean;
  pathInMiddlePanel?: boolean;
  hideLoading?: boolean;
  nativeScrollbars?: boolean;
  hideDownloadButton?: boolean;
  disableSearch?: boolean;
  onlyRequiredInSamples?: boolean;
  docName?: string;
  auth?: DocAuth;
  tagGroups?: DocTagGroup[];
}

export interface DogLogo {
  url?: string;
  backgroundColor?: string;
  altText?: string;
  href?: string;
}

export interface DocAuth {
  enabled: boolean;
  user: string;
  password: string;
}

export interface DocTagGroup {
  name: string;
  tags: string[];
}

export interface DocOptions extends DocRedocOptions {
  enumSkipQuotes?: boolean;
  disableTryIt?: boolean;
  authBtnText?: string;
  authBtnPosSelector?: string;
  openApiUrl?: string;
  version?: string;
  description?: string;
  servers?: DocServer[];
  security?: DocSecurity[];
  tags?: DocTag[];
  theme?: DocTheme;
}

export interface DocThemeGeneratorParams {
  logoGutter?: string;
  sidebarBackgroundColor: string;
  sidebarTextColor: string;
  rightPanelBackgroundColor: string;
  rightPanelTextColor: string;
  backgroundColor: string;
  textColor: string;
  accentColor: string;
  successColor: string;
  warningColor: string;
  errorColor: string;
  fontFamily: string;
  fontSize?: string;
  headingsFontFamily: string;
  headingsFontWeight?: string;
  codeFontFamily: string;
  codeFontSize?: string;
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

export interface DocTypography {
  fontSize?: string;
  lineHeight?: string;
  fontWeightLight?: string;
  fontWeightRegular?: string;
  fontWeightBold?: string;
  fontFamily?: string;
  smoothing?: string;
  optimizeSpeed?: boolean;
  code?: {
    fontSize?: string;
    fontWeight?: string;
    fontFamily?: string;
    lineHeight?: string;
    color?: string;
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

export interface DocCodeSampleOptions {
  method: string;
  url: string;
  headers: {
    key: string;
    value: string;
  }[];
  query?: string;
  body?: string;
}

export interface DocCodeSample {
  lang: string;
  source: string;
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
  typography?: DocTypography;
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
