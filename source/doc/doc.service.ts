import { Injectable } from '@nestjs/common';
import { OpenAPIObject } from '@nestjs/swagger';
import { ReferenceObject, SchemaObject } from '@nestjs/swagger/dist/interfaces/open-api-spec.interface';
import HTTPSnippet from 'httpsnippet';

import { AppConfig } from '../app/app.config';
import { AppMemoryKey } from '../app/app.enum';
import { ContextService } from '../context/context.service';
import { MemoryService } from '../memory/memory.service';
import { DocRenderOptions } from './doc.interface';

@Injectable()
export class DocService {

  private codeSamplesGenerated: boolean;

  public constructor(
    private readonly appConfig: AppConfig,
    private readonly contextService: ContextService,
    private readonly memoryService: MemoryService,
  ) { }

  /**
   * Build Redoc page rendering options which isolates
   * necessary data from template and stringify the
   * underlying component params.
   *
   * During the first call to `/docs` endpoint, generate
   * code samples based on current host.
   */
  public buildRenderOptions(): DocRenderOptions {
    const { docs } = this.appConfig.APP_OPTIONS;
    const { disableTryIt, openApiUrl, title, favicon, theme } = docs;
    const { backgroundColor, scrollbar } = theme;

    if (!this.codeSamplesGenerated) {
      const document: OpenAPIObject = this.memoryService.get(AppMemoryKey.OPEN_API_SPECIFICATION);
      this.generateCodeSamples(document);
      this.codeSamplesGenerated = true;
    }

    const options = { ...docs };
    delete options.disableTryIt;
    delete options.documentBuilder;
    delete options.openApiUrl;
    delete options.version;
    delete options.description;
    delete options.security;
    delete options.theme.backgroundColor;
    delete options.theme.scrollbar;
    delete options.codeSamples;

    return {
      disableTryIt,
      openApiUrl,
      title,
      favicon,
      backgroundColor,
      scrollbar,
      options: JSON.stringify(options),
    };
  }

  /**
   * Generate code samples in place for target document.
   * @param document
   */
  private generateCodeSamples(document: OpenAPIObject): void {
    const reqProtocol = this.contextService.getRequestProtocol();
    const reqHost = this.contextService.getRequestHost();
    const reqPath = this.contextService.getRequestPath();
    const { docs } = this.appConfig.APP_OPTIONS || { };
    const { paths } = document;

    for (const path in paths) {
      for (const method in paths[path]) {
        const jsonType = 'application/json';
        const bodySchema: ReferenceObject = paths[path][method].requestBody?.content[jsonType]?.schema;

        const snippetBaseUrl = `${reqProtocol}://${reqHost}${reqPath.replace(/\/docs$/, '')}`;
        const snippetPath = path.replace('{', ':').replace('}', '');
        const snippetOptions = { indent: ' ' };

        const snippet = new HTTPSnippet({
          method: method.toUpperCase(),
          url: `${snippetBaseUrl}${snippetPath}`,
          headers: bodySchema
            ? [
              { name: 'Content-Type', value: jsonType },
            ]
            : undefined,
          postData: bodySchema
            ? {
              mimeType: jsonType,
              text: JSON.stringify(this.schemaToSample(bodySchema, document)),
            }
            : undefined,
        } as HTTPSnippet.Data);

        paths[path][method]['x-codeSamples'] = docs.codeSamples.map((s) => {
          const [ target, ...clientParts ] = s.client.toLowerCase().split('_');
          return {
            lang: s.label,
            source: snippet.convert(target, clientParts.join('_'), snippetOptions),
          };
        });
      }
    }
  }

  /**
   * Converts target schema to a JSON sample.
   * @param schema
   * @param document
   */
  private schemaToSample(schema: SchemaObject | ReferenceObject, document: OpenAPIObject): any {
    const schemaObject = schema['$ref']
      ? document.components.schemas[schema['$ref'].split('/')[3]] as SchemaObject
      : schema as SchemaObject;

    const { type, items, properties } = schemaObject;

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
  private buildSampleValue(schema: SchemaObject, fallback: any): any {
    const { type, examples, example, enum: enumValue, default: defaultValue, format } = schema;

    return type === 'string'
      ? examples?.[0] ?? example ?? enumValue?.[0] ?? defaultValue ?? format ?? fallback
      : examples?.[0] ?? example ?? enumValue?.[0] ?? defaultValue ?? fallback;
  }

}
