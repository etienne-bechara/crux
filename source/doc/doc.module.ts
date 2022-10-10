import { INestApplication, Module } from '@nestjs/common';
import { DocumentBuilder, OpenAPIObject, SwaggerModule } from '@nestjs/swagger';
import { ReferenceObject, SchemaObject } from '@nestjs/swagger/dist/interfaces/open-api-spec.interface';
import handlebars from 'handlebars';
import HTTPSnippet from 'httpsnippet';
import path from 'path';

import { AppMemoryKey } from '../app/app.enum';
import { AppOptions } from '../app/app.interface';
import { MemoryService } from '../memory/memory.service';
import { DocController } from './doc.controller';
import { DocTagStorage } from './doc.decorator';
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
    const { title, description, version, documentBuilder, servers, security } = docs;

    const builder = documentBuilder || new DocumentBuilder()
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
        const jsonType = 'application/json';
        const bodySchema: ReferenceObject = paths[path][method].requestBody?.content[jsonType]?.schema;

        const snippetBaseUrl = servers[0].url;
        const snippetPath = path.replace('{', ':').replace('}', '');
        const snippetOptions = { indent: ' ' };

        const httpSnippet = new HTTPSnippet({
          method: method.toUpperCase(),
          url: `${snippetBaseUrl}${snippetPath}`,
          headers: bodySchema
            ? [ { name: 'Content-Type', value: jsonType } ]
            : undefined,
          postData: bodySchema
            ? { mimeType: jsonType, text: JSON.stringify(this.schemaToSample(bodySchema, document)) }
            : undefined,
        } as HTTPSnippet.Data);

        paths[path][method]['x-codeSamples'] = codeSamples.map((s) => {
          const [ target, ...clientParts ] = s.client.toLowerCase().split('_');
          const snippet = httpSnippet.convert(target, clientParts.join('_'), snippetOptions) as string;

          // Fix PowerShell not printing response
          const source = snippet.replace('$response = Invoke-WebRequest', 'Invoke-WebRequest');

          return { lang: s.label, source };
        });
      }
    }
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
  private static buildSampleValue(schema: SchemaObject, fallback: any): any {
    const { type, examples, example, enum: enumValue, default: defaultValue, format } = schema;

    return type === 'string'
      ? examples?.[0] ?? example ?? enumValue?.[0] ?? defaultValue ?? format ?? fallback
      : examples?.[0] ?? example ?? enumValue?.[0] ?? defaultValue ?? fallback;
  }

}
