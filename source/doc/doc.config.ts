/* eslint-disable @typescript-eslint/naming-convention */
import { DocCodeSampleClient } from './doc.enum';
import { DocOptions, DocTheme } from './doc.interface';

/**
 * Builds upon default theme available at:
 * https://github.com/Redocly/redoc/blob/main/src/theme.ts.
 *
 * Theming sandbox is available at:
 * https://pointnet.github.io/redoc-editor.
 */
export const DOC_DEFAULT_THEME: DocTheme = {
  logo: {
    gutter: '35px',
  },
  typography: {
    smoothing: 'subpixel-antialiased',
    fontSize: '15px',
    fontFamily: 'Segoe WP',
    headings: {
      fontFamily: 'Segoe WP',
    },
    code: {
      wrap: true,
      fontFamily: 'Code New Roman',
    },
  },
  colors: {
    text: {
      primary: '#333333',
    },
    primary: {
      main: '#32329f',
    },
  },
  rightPanel: {
    backgroundColor: '#263238',
    textColor: '#ffffff',
    servers: {
      overlay: {
        backgroundColor: '#11171a',
      },
      url: {
        backgroundColor: '#263238',
      },
    },
  },
  codeBlock: {
    backgroundColor: '#11171a',
  },
  scrollbar: {
    width: '16px',
    thumbColor: '#263238',
    trackColor: '#192226',
  },
};

export const DOC_DEFAULT_OPTIONS: DocOptions = {
  disableTryIt: false,
  hideLoading: true,
  enumSkipQuotes: true,
  title: 'API Reference | OpenAPI',
  version: 'v1',
  favicon: 'https://www.openapis.org/wp-content/uploads/sites/3/2016/11/favicon.png',
  logo: { url: 'https://www.openapis.org/wp-content/uploads/sites/3/2016/10/OpenAPI_Pantone.png' },
  theme: DOC_DEFAULT_THEME,
  codeSamples: [
    { label: 'cURL', client: DocCodeSampleClient.SHELL_CURL },
    { label: 'PowerShell', client: DocCodeSampleClient.POWERSHELL_WEBREQUEST },
  ],
};
