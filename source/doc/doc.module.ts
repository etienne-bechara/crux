import { INestApplication, Module } from '@nestjs/common';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';

import { OperationObject, PathItemObject, SchemaObject } from '@nestjs/swagger/dist/interfaces/open-api-spec.interface';
import { AppMemoryKey } from '../app/app.enum';
import { AppOptions } from '../app/app.interface';
import { MemoryService } from '../memory/memory.service';
import { DocController } from './doc.controller';
import { DocTagStorage } from './doc.decorator';
import { DocOpenApi } from './doc.interface';
import { DocService } from './doc.service';

@Module({
	controllers: [DocController],
	providers: [DocService],
	exports: [DocService],
})
export class DocModule {
	/**
	 * Creates the OpenAPI specification document.
	 * @param instance
	 * @param options
	 */
	public static configureDocumentation(instance: INestApplication, options: AppOptions): void {
		const { docs } = options;
		const { tagGroups } = docs;

		const builder = DocModule.configureBuilder(options);
		const document = DocModule.buildOpenApiObject(instance, builder);

		DocModule.coalesceSchemaTitles(document);
		DocModule.coalescePathSummaries(document);

		document['x-tagGroups'] = tagGroups;

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
			.setDescription(description || '')
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
	private static buildOpenApiObject(instance: INestApplication, builder: DocumentBuilder): DocOpenApi {
		return SwaggerModule.createDocument(instance, builder.build(), {
			ignoreGlobalPrefix: true,
			operationIdFactory: (controllerKey: string, methodKey: string) => {
				const titleCase = methodKey.replaceAll(/([A-Z])/g, ' $1');
				return `${titleCase.charAt(0).toUpperCase()}${titleCase.slice(1)}`;
			},
		}) as DocOpenApi;
	}

	/**
	 * Add missing titles to components schemas.
	 * @param document
	 */
	private static coalesceSchemaTitles(document: DocOpenApi): void {
		const { components } = document;
		const { schemas } = components;

		for (const key in schemas) {
			const schema = schemas[key] as SchemaObject;
			schema.title ||= key;
		}
	}

	/**
	 * Add missing summaries to path schemas.
	 * @param document
	 */
	private static coalescePathSummaries(document: DocOpenApi): void {
		const { paths } = document;

		for (const path in paths) {
			for (const method in paths[path]) {
				const operation = paths[path][method as keyof PathItemObject] as OperationObject;
				operation.summary ||= operation.operationId;
			}
		}
	}
}
