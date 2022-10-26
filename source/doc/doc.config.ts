/* eslint-disable @typescript-eslint/naming-convention */
import { DocCodeSampleClient } from './doc.enum';
import { DocOptions } from './doc.interface';

export const DOC_DEFAULT_OPTIONS: DocOptions = {
  disableTryIt: false,
  hideLoading: true,
  enumSkipQuotes: true,
  noAutoAuth: true,
  authBtnText: 'Authenticate',
  authBtnPosSelector: '.sc-dFRpbK:eq(0)',
  title: 'API Reference | OpenAPI',
  version: 'v1',
  favicon: 'https://www.openapis.org/wp-content/uploads/sites/3/2016/11/favicon.png',
  logo: { url: 'https://www.openapis.org/wp-content/uploads/sites/3/2018/02/OpenAPI_Logo_White.png' },
  theme: {
    backgroundColor: '#2f333d',
    scrollbar: {
      width: '16px',
      thumbColor: '#282c34',
      trackColor: '#2f333d',
    },
    colors: {
      primary: {
        main: '#61afef',
      },
      success: {
        main: '#98c379',
      },
      warning: {
        main: '#e5c07b',
      },
      error: {
        main: '#e06c75',
      },
      text: {
        primary: '#ffffff',
      },
      http: {
        get: '#98c379',
        post: '#e5c07b',
        put: '#61afef',
        options: '#98c379',
        patch: '#61afef',
        delete: '#e06c75',
        basic: '#98c379',
        link: '#98c379',
        head: '#98c379',
      },
    },
    schema: {
      nestedBackground: '#282c34',
    },
    typography: {
      fontSize: '15px',
      fontFamily: 'Segoe WP',
      smoothing: 'subpixel-antialiased',
      optimizeSpeed: false,
      headings: {
        fontFamily: 'Segoe WP',
        fontWeight: '700',
      },
      code: {
        fontFamily: 'Code New Roman',
        fontSize: '13px',
        color: '#ffffff',
        backgroundColor: '#21252b',
        wrap: true,
      },
    },
    sidebar: {
      backgroundColor: '#21252b',
      textColor: '#ffffff',
    },
    logo: {
      gutter: '35px',
    },
    rightPanel: {
      backgroundColor: '#282c34',
      textColor: '#ffffff',
      servers: {
        overlay: {
          backgroundColor: '#21252b',
          textColor: '#ffffff',
        },
        url: {
          backgroundColor: '#282c34',
        },
      },
    },
    codeBlock: {
      backgroundColor: '#21252b',
    },
    fab: {
      backgroundColor: '#21252b',
      color: '#ffffff',
    },
  },
  codeSamples: [
    { label: 'cURL', client: DocCodeSampleClient.SHELL_CURL },
    { label: 'PowerShell', client: DocCodeSampleClient.POWERSHELL_WEBREQUEST },
  ],
};
