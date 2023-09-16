import { INestApplication, Module } from '@nestjs/common';
import { DocumentBuilder, OpenAPIObject, SwaggerModule } from '@nestjs/swagger';
import { ReferenceObject, SchemaObject } from '@nestjs/swagger/dist/interfaces/open-api-spec.interface';
import fs from 'fs';
import qs from 'query-string';

import { AppMemoryKey } from '../app/app.enum';
import { AppOptions } from '../app/app.interface';
import { MemoryService } from '../memory/memory.service';
import { DocController } from './doc.controller';
import { DocTagStorage } from './doc.decorator';
import { DocCodeSample, DocCodeSampleOptions, DocTheme, DocThemeGeneratorParams } from './doc.interface';
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
      DocTagStorage.push(...tags);
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
          case 'get' : {
            operationId = `Read ${entityName}`;
            break;
          }

          case 'pos' : {
            operationId = `Create ${entityName}`;
            break;
          }

          case 'put' : {
            operationId = `Replace ${entityName}`;
            break;
          }

          case 'pat' : {
            operationId = `Update ${entityName}`;
            break;
          }

          case 'del' : {
            operationId = `Delete ${entityName}`;
            break;
          }

          default: {
            operationId = defaultId;
          }
        }

        if (methodKey.includes('Id')) {
          operationId = `${operationId} by ID`;
        }

        return entityName ? operationId : defaultId;
      },
    });
  }

  /**
   * Generate code samples for command shells.
   * @param document
   * @param options
   */
  public static generateCodeSamples(document: OpenAPIObject, options: AppOptions): void {
    const { paths } = document;
    const { docs } = options;
    const { servers, security } = docs;

    const authOptions = security?.[0]?.options;

    for (const path in paths) {
      for (const method in paths[path]) {
        const pathParams = paths[path][method].parameters.filter((p) => p.required && p.in === 'path');
        const queryParams = paths[path][method].parameters.filter((p) => p.required && p.in === 'query');
        const bodyParams = paths[path][method].requestBody;

        const codeSampleOptions: DocCodeSampleOptions = {
          method: method.toUpperCase(),
          url: `${servers[0].url}${path}`,
          headers: authOptions?.in === 'header'
            ? [ { key: authOptions.name, value: 'your_authorization' } ]
            : [ ],
        };

        if (pathParams.length > 0) {
          for (const pathParameter of pathParams) {
            const { name, example, schema } = pathParameter;
            const ref = { ...schema, example };

            const value: string = this.schemaToSample(ref as ReferenceObject, document);
            codeSampleOptions.url = codeSampleOptions.url.replace(`{${name}}`, value);
          }
        }

        if (queryParams.length > 0) {
          const queryObj = { };

          for (const queryParam of queryParams) {
            const { name, example, schema } = queryParam;
            const ref = { ...schema, example };
            queryObj[name] = String(this.schemaToSample(ref as ReferenceObject, document));
          }

          codeSampleOptions.query = qs.stringify(queryObj);
        }

        if (bodyParams) {
          const jsonSchema: ReferenceObject = bodyParams?.content['application/json']?.schema;

          if (jsonSchema) {
            codeSampleOptions.headers.push({ key: 'Content-Type', value: 'application/json' });
            codeSampleOptions.body = JSON.stringify(this.schemaToSample(jsonSchema, document));
          }
        }

        paths[path][method]['x-codeSamples'] = [
          this.buildCurlCodeSample(codeSampleOptions),
          this.buildPowerShellCodeSample(codeSampleOptions),
        ];
      }
    }
  }

  /**
   * Builds a cURL sample snippet.
   * @param params
   */
  private static buildCurlCodeSample(params: DocCodeSampleOptions): DocCodeSample {
    const { method, url, headers, query, body } = params;

    let source = `curl --request ${method} \\\n`;
    source += `--url '${url}${query ? `?${query}` : ''}' \\\n`;

    for (const header of headers) {
      source += `--header '${header.key}: ${header.value}' \\\n`;
    }

    if (body) {
      source += `--data '${body}'`;
    }

    return { lang: 'cURL', source };
  }

  /**
   * Builds a PowerShell sample snippet.
   * @param params
   */
  private static buildPowerShellCodeSample(params: DocCodeSampleOptions): DocCodeSample {
    const { method, url, headers, query, body } = params;
    let source = '$headers=@{}\n';

    for (const header of headers) {
      source += `$headers.Add("${header.key}", "${header.value}")\n`;
    }

    // eslint-disable-next-line max-len
    source += `$response = Invoke-WebRequest -Uri '${url}${query ? `?${query}` : ''}' -Method ${method} -Headers $headers`;
    source += body ? ` -Body '${body}'\n` : '\n';

    source += 'Write-Output $response';

    return { lang: 'PowerShell', source };
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
      case 'boolean': {
        return this.buildSampleValue(schemaObject, true);
      }

      case 'number': {
        return this.buildSampleValue(schemaObject, 1);
      }

      case 'string': {
        return this.buildSampleValue(schemaObject, 'string');
      }

      case 'array': {
        return [ this.schemaToSample(items, document) ];
      }

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
        trackColor: params.backgroundColor,
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
