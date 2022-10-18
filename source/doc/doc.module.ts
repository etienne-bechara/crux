import { INestApplication, Module } from '@nestjs/common';
import { DocumentBuilder, OpenAPIObject, SwaggerModule } from '@nestjs/swagger';
import { ReferenceObject, SchemaObject } from '@nestjs/swagger/dist/interfaces/open-api-spec.interface';
import fs from 'fs';
import handlebars from 'handlebars';
import HTTPSnippet from 'httpsnippet';
import path from 'path';

import { AppMemoryKey } from '../app/app.enum';
import { AppOptions } from '../app/app.interface';
import { MemoryService } from '../memory/memory.service';
import { DocController } from './doc.controller';
import { DocTagStorage } from './doc.decorator';
import { DocCodeSampleClient } from './doc.enum';
import { DocHttpSnippetParams, DocTheme, DocThemeGeneratorParams } from './doc.interface';
import { DocService } from './doc.service';

@Module({
  controllers: [
    DocController,
  ],
  providers: [
    DocService,
  ],
  exports: [
    DocService,
  ],
})
export class DocModule {

  public static hasServers: boolean;

  /**
   * Creates the OpenAPI specification document and configures
   * the rendered ReDoc webpage.
   * @param instance
   * @param options
   */
  public static configureDocumentation(instance: INestApplication, options: AppOptions): void {
    const { docs } = options;
    const { logo, tagGroups, servers } = docs;

    this.configureViewEngine(instance);
    const builder = this.configureBuilder(options);
    const document = this.buildOpenApiObject(instance, builder);

    if (servers?.length > 0) {
      this.hasServers = true;
      this.generateCodeSamples(document, options);
    }

    document['x-tagGroups'] = tagGroups;
    document.info['x-logo'] = logo;

    const memoryService: MemoryService = instance.get(MemoryService);
    memoryService.set(AppMemoryKey.OPEN_API_SPECIFICATION, document);

    SwaggerModule.setup('openapi', instance, document, { useGlobalPrefix: true });
  }

  /**
   * Configures view engine to support handlebars.
   * @param instance
   */
  private static configureViewEngine(instance: INestApplication): void {
    instance['setViewEngine']({
      engine: { handlebars },
      // eslint-disable-next-line unicorn/prefer-module
      templates: path.join(__dirname, '..', 'doc'),
    });
  }

  /**
   * Configures the OpenAPI spec builder by setting title, description,
   * version, proxy prefixes and tags.
   * @param options
   */
  private static configureBuilder(options: AppOptions): DocumentBuilder {
    const { docs } = options;
    const { title, description, version, servers, security, tags } = docs;

    const builder = new DocumentBuilder()
      .setTitle(title)
      .setDescription(description)
      .setVersion(version);

    if (servers) {
      for (const server of servers) {
        const { url, description } = server;
        builder.addServer(url, description);
      }
    }

    if (security) {
      for (const { name, options } of security) {
        builder.addSecurity(name, options);
      }
    }

    if (tags) {
      for (const { name, description } of tags) {
        builder.addTag(name, description);
      }
    }

    for (const tag of DocTagStorage) {
      const { name, description, externalDocs } = tag;
      builder.addTag(name, description, externalDocs);
    }

    return builder;
  }

  /**
   * Build the OpenAPI specification object, automatically create an
   * operation id based on controller method name.
   * @param instance
   * @param builder
   */
  private static buildOpenApiObject(instance: INestApplication, builder: DocumentBuilder): OpenAPIObject {
    return SwaggerModule.createDocument(instance, builder.build(), {
      ignoreGlobalPrefix: true,
      operationIdFactory: (controllerKey: string, methodKey: string) => {
        const entityName = controllerKey.replace('Controller', '');
        const defaultId = `${controllerKey}_${methodKey}`;
        let operationId: string;

        switch (methodKey.slice(0, 3)) {
          case 'get' : operationId = `Read ${entityName}`; break;
          case 'pos' : operationId = `Create ${entityName}`; break;
          case 'put' : operationId = `Replace ${entityName}`; break;
          case 'pat' : operationId = `Update ${entityName}`; break;
          case 'del' : operationId = `Delete ${entityName}`; break;
          default: operationId = defaultId;
        }

        if (methodKey.includes('Id')) {
          operationId = `${operationId} by ID`;
        }

        return entityName ? operationId : defaultId;
      },
    });
  }

  /**
   * Generate code samples in place for target document.
   * @param document
   * @param options
   */
  public static generateCodeSamples(document: OpenAPIObject, options: AppOptions): void {
    const { paths } = document;
    const { docs } = options;
    const { servers, codeSamples } = docs;

    for (const path in paths) {
      for (const method in paths[path]) {
        const snippetOptions = { indent: ' ' };
        const httpSnippet = this.buildHttpSnippet({ document, servers, path, method });

        paths[path][method]['x-codeSamples'] = codeSamples.map((s) => {
          const [ target, ...clientParts ] = s.client.toLowerCase().split('_');
          const snippet = httpSnippet.convert(target, clientParts.join('_'), snippetOptions) as string;

          // Fix PowerShell not printing response
          const source = s.client === DocCodeSampleClient.POWERSHELL_WEBREQUEST
            ? `${snippet}\nWrite-Output $response`
            : snippet;

          return { lang: s.label, source };
        });
      }
    }
  }

  /**
   * Builds an instance of the HTTP snippets generator.
   * @param params
   */
  private static buildHttpSnippet(params: DocHttpSnippetParams): HTTPSnippet {
    const { document, servers, path, method: rawMethod } = params;
    const { paths } = document;

    const pathParameters = paths[path][rawMethod].parameters.filter((p) => p.required && p.in === 'path');
    const queryParameters = paths[path][rawMethod].parameters.filter((p) => p.required && p.in === 'query');
    const requestBody = paths[path][rawMethod].requestBody;

    const httpSnippetOptions = {
      method: rawMethod.toUpperCase(),
      url: `${servers[0].url}${path}`,
    } as any;

    if (pathParameters.length > 0) {
      for (const pathParameter of pathParameters) {
        const { name, example, schema } = pathParameter;
        const ref = { ...schema, example };

        const value = this.schemaToSample(ref as ReferenceObject, document);
        httpSnippetOptions.url = httpSnippetOptions.url.replace(`{${name}}`, value);
      }
    }

    if (queryParameters.length > 0) {
      httpSnippetOptions.queryString = queryParameters.map((p) => {
        const { name, example, schema } = p;
        const ref = { ...schema, example };

        const value = String(this.schemaToSample(ref as ReferenceObject, document));
        return { name, value };
      });
    }

    if (requestBody) {
      const jsonSchema: ReferenceObject = requestBody?.content['application/json']?.schema;

      if (jsonSchema) {
        httpSnippetOptions.headers = [ { name: 'Content-Type', value: 'application/json' } ];

        httpSnippetOptions.postData = {
          mimeType: 'application/json',
          text: JSON.stringify(this.schemaToSample(jsonSchema, document)),
        };
      }
    }

    return new HTTPSnippet(httpSnippetOptions as HTTPSnippet.Data);
  }

  /**
   * Converts target schema to a JSON sample.
   * @param schema
   * @param document
   */
  private static schemaToSample(schema: SchemaObject | ReferenceObject, document: OpenAPIObject): any {
    const schemaObject = schema['$ref']
      ? document.components.schemas[schema['$ref'].split('/')[3]] as SchemaObject
      : schema as SchemaObject;

    const { type, items, properties, required } = schemaObject;

    switch (type) {
      case 'boolean':
        return this.buildSampleValue(schemaObject, true);

      case 'number':
        return this.buildSampleValue(schemaObject, 1);

      case 'string':
        return this.buildSampleValue(schemaObject, 'string');

      case 'array':
        return [ this.schemaToSample(items, document) ];

      case 'object': {
        const obj = { };

        for (const property in properties) {
          if (!required?.includes(property)) continue;
          obj[property] = this.schemaToSample(properties[property], document);
        }

        return obj;
      }
    }
  }

  /**
   * Build a sample value for target schema by coalescing multiple data.
   * @param schema
   * @param fallback
   */
  private static buildSampleValue(schema: SchemaObject, fallback: any): any {
    const { type, examples, example, enum: enumValue, default: defaultValue, format } = schema;

    return type === 'string'
      ? examples?.[0] ?? example ?? enumValue?.[0] ?? defaultValue ?? format ?? fallback
      : examples?.[0] ?? example ?? enumValue?.[0] ?? defaultValue ?? fallback;
  }

  /**
   * Reads a markdown file relative to project root.
   * @param path
   */
  public static readFile(path: string): string {
    if (!path.endsWith('.md')) {
      throw new Error('documentation file should be in markdown format');
    }

    return fs.readFileSync(path).toString();
  }

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
  public static generateTheme(params: DocThemeGeneratorParams): DocTheme {
    return {
      backgroundColor: params.backgroundColor,
      scrollbar: {
        width: '16px',
        thumbColor: params.rightPanelBackgroundColor,
        trackColor: params.sidebarBackgroundColor,
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
        nestedBackground: params.rightPanelBackgroundColor,
      },
      typography: {
        fontSize: params.fontSize || '15px',
        fontFamily: params.fontFamily,
        smoothing: 'subpixel-antialiased',
        optimizeSpeed: false,
        headings: {
          fontFamily: params.headingsFontFamily,
          fontWeight: params.headingsFontWeight || '700',
        },
        code: {
          fontFamily: params.codeFontFamily,
          fontSize: params.codeFontSize || '13px',
          color: params.rightPanelTextColor,
          backgroundColor: params.sidebarBackgroundColor,
          wrap: true,
        },
      },
      sidebar: {
        backgroundColor: params.sidebarBackgroundColor,
        textColor: params.sidebarTextColor,
      },
      logo: {
        gutter: params.logoGutter || '35px',
      },
      rightPanel: {
        backgroundColor: params.rightPanelBackgroundColor,
        textColor: params.rightPanelTextColor,
        servers: {
          overlay: {
            backgroundColor: params.sidebarBackgroundColor,
            textColor: params.sidebarTextColor,
          },
          url: {
            backgroundColor: params.rightPanelBackgroundColor,
          },
        },
      },
      codeBlock: {
        backgroundColor: params.sidebarBackgroundColor,
      },
      fab: {
        backgroundColor: params.sidebarBackgroundColor,
        color: params.sidebarTextColor,
      },
    };
  }

}
