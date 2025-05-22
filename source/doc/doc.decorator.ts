import { applyDecorators } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';

import { DocTag } from './doc.interface';

export const DocTagStorage: DocTag[] = [];

/**
 * Sets a documentation tag to target with description and
 * external docs support.
 * @param tag
 */
export function ApiTag(tag: DocTag): MethodDecorator & ClassDecorator {
	const { name, description, externalDocs } = tag;
	const matchingTag = DocTagStorage.find((t) => t.name === name);

	if (matchingTag) {
		matchingTag.description ??= description;
		matchingTag.externalDocs ??= externalDocs;
	} else {
		DocTagStorage.push({ name, description });
	}

	return applyDecorators(ApiTags(name));
}
