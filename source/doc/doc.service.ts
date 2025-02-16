import { Injectable } from '@nestjs/common';

import { AppConfig } from '../app/app.config';

@Injectable()
export class DocService {

  public constructor(
    private readonly appConfig: AppConfig,
  ) { }

  /**
   * Creates a simple HTMl page which will render the generated
   * OpenAPI specification using Scalar:
   * https://guides.scalar.com/scalar/scalar-api-references/html.
   */
  public generateScalarHtml(): string {
    const { docs } = this.appConfig.APP_OPTIONS;
    const { title, favicon } = docs;

    return `
<!doctype html>
<html>
  <head>
    <title>${title}</title>
    <link rel="icon" type="image/x-icon" href="${favicon}">
    <meta charset="utf-8" />
    <meta
      name="viewport"
      content="width=device-width, initial-scale=1" />
  </head>
  <body>
    <script
      id="api-reference"
      data-url="/docs/json"></script>
    <script src="https://cdn.jsdelivr.net/npm/@scalar/api-reference"></script>
  </body>
</html>
`;
  }

}
