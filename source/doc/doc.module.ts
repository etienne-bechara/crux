import { INestApplication, Module } from '@nestjs/common';
import { DocumentBuilder, OpenAPIObject, SwaggerModule } from '@nestjs/swagger';
import handlebars from 'handlebars';
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

  /**
   * Creates the OpenAPI specification document and configures
   * the rendered ReDoc webpage.
   * @param instance
   * @param options
   */
  public static configureDocumentation(instance: INestApplication, options: AppOptions): void {
    const { docs } = options;
    const { logo, tagGroups } = docs;

    this.configureViewEngine(instance);
    const builder = this.configureBuilder(options);
    const document = this.buildOpenApiObject(instance, builder);

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
    const { globalPrefix, proxyPrefix, docs } = options;
    const { title, description, version, documentBuilder } = docs;

    const builder = documentBuilder || new DocumentBuilder()
      .setTitle(title)
      .setDescription(description)
      .setVersion(version);

    if (proxyPrefix || globalPrefix) {
      const server = proxyPrefix && globalPrefix
        ? `${proxyPrefix}/${globalPrefix}`
        : proxyPrefix || globalPrefix;

      builder.addServer(`/${server}`);
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

}
