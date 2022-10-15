/* eslint-disable @typescript-eslint/naming-convention */
import { DocCodeSampleClient } from './doc.enum';
import { DocOptions, DocTheme, DocThemeGeneratorParams } from './doc.interface';

/**
 * Generates documentation theme based on simplified inputs.
 *
 * Builds upon default interface available at:
 * https://github.com/Redocly/redoc/blob/main/src/theme.ts.
 *
 * Theming sandbox is available at:
 * https://pointnet.github.io/redoc-editor.
 * @param params
 */
export const docThemeGenerator = (params: DocThemeGeneratorParams): DocTheme => ({
  backgroundColor: params.backgroundColor,
  scrollbar: {
    width: '16px',
    thumbColor: params.rightPanelColor,
    trackColor: params.sidebarColor,
  },
  colors: {
    primary: {
      main: params.accentColor,
    },
    success: {
      main: params.successColor,
    },
    warning: {
      main: params.warningColor,
    },
    error: {
      main: params.errorColor,
    },
    text: {
      primary: params.textColor,
    },
    http: {
      get: params.successColor,
      post: params.warningColor,
      put: params.accentColor,
      options: params.successColor,
      patch: params.accentColor,
      delete: params.errorColor,
      basic: params.successColor,
      link: params.successColor,
      head: params.successColor,
    },
  },
  schema: {
    nestedBackground: params.rightPanelColor,
  },
  typography: {
    fontSize: params.fontSize,
    fontFamily: params.fontFamily,
    smoothing: 'subpixel-antialiased',
    headings: {
      fontFamily: params.fontFamily,
      fontWeight: params.headingsFontWeight,
    },
    code: {
      fontFamily: params.codeFontFamily,
      fontSize: params.codeFontSize,
      color: params.textColor,
      backgroundColor: params.sidebarColor,
      wrap: true,
    },
  },
  sidebar: {
    backgroundColor: params.sidebarColor,
    textColor: params.textColor,
  },
  logo: {
    gutter: params.logoGutter,
  },
  rightPanel: {
    backgroundColor: params.rightPanelColor,
    textColor: params.textColor,
    servers: {
      overlay: {
        backgroundColor: params.sidebarColor,
        textColor: params.textColor,
      },
      url: {
        backgroundColor: params.rightPanelColor,
      },
    },
  },
  codeBlock: {
    backgroundColor: params.sidebarColor,
  },
  fab: {
    backgroundColor: params.sidebarColor,
    color: params.textColor,
  },
});

export const DOC_DEFAULT_OPTIONS: DocOptions = {
  disableTryIt: false,
  hideLoading: true,
  enumSkipQuotes: true,
  title: 'API Reference | OpenAPI',
  version: 'v1',
  favicon: 'https://www.openapis.org/wp-content/uploads/sites/3/2016/11/favicon.png',
  logo: { url: 'https://www.openapis.org/wp-content/uploads/sites/3/2018/02/OpenAPI_Logo_White.png' },
  theme: docThemeGenerator({
    logoGutter: '35px',
    sidebarColor: '#21252b',
    rightPanelColor: '#282c34',
    backgroundColor: '#2f333d',
    textColor: '#ffffff',
    accentColor: '#61afef',
    successColor: '#98c379',
    warningColor: '#e5c07b',
    errorColor: '#e06c75',
    fontFamily: 'Segoe WP',
    fontSize: '15px',
    headingsFontFamily: 'Segoe WP',
    headingsFontWeight: '600',
    codeFontFamily: 'Code New Roman',
    codeFontSize: '13px',
  }),
  codeSamples: [
    { label: 'cURL', client: DocCodeSampleClient.SHELL_CURL },
    { label: 'PowerShell', client: DocCodeSampleClient.POWERSHELL_WEBREQUEST },
  ],
};
