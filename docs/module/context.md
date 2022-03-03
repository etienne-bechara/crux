# Context Module

In order to access request specific data inside a provider, NestJS offers the `REQUEST` scope option during dependency injection.

This practice comes with several downsides, including performance and failure to resolve dependency tree.

The `ContextService` offers an stable alternative, based on NodeJS async local storage, to access request data anywhere.

---

## Usage

Simply inject the `ContextService` at your target provider:

```ts
import { ContextService } from '@bechara/nestjs-core';

@Injectable()
export class FooService {

  public constructor(
    private readonly contextService: ContextService,
  ) { }

  public async getRequestAuthorization() {
    const req = this.contextService.getRequest();
    return req.headers.authorization;
  }

  public async getUserId() {
    return this.contextService.getMetadataKey('userId');
  }

  public async setUserId(userId: string) {
    this.contextService.setMetadataKey('userId', userId);
  }

}
```

---

[Back to title](../../README.md)
