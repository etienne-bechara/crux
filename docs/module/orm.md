# ORM Module

Adds ORM capabilities including schema sync and repository pattern.

---

## Usage

Add these example variables to your `.env` (adjust accordingly):

```bash
# Standard connection
ORM_TYPE='mysql'
ORM_HOST='localhost'
ORM_PORT=3306
ORM_USERNAME='root'
ORM_PASSWORD=''
ORM_DATABASE='test'

# SSL options
ORM_SERVER_CA=''
ORM_CLIENT_CERTIFICATE=''
ORM_CLIENT_KEY=''
```

It is recommended that you have a local database in order to test connectivity.

Import `OrmModule` and `OrmConfig` into you boot script and configure asynchronously:

```ts
import { AppEnvironment, AppModule } from '@bechara/nestjs-core';
import { OrmConfig. OrmModule } from '@bechara/nestjs-orm';

void AppModule.bootServer({
  configs: [ OrmConfig ],
  imports: [
    OrmModule.registerAsync({
      inject: [ OrmConfig ],
      useFactory: (ormConfig: OrmConfig) => ({
        type: ormConfig.ORM_TYPE,
        host: ormConfig.ORM_HOST,
        port: ormConfig.ORM_PORT,
        dbName: ormConfig.ORM_DATABASE,
        user: ormConfig.ORM_USERNAME,
        password: ormConfig.ORM_PASSWORD,
        pool: { min: 1, max: 25 },
        sync: {
          auto: true,
          controller: true,
          safe: ormConfig.NODE_ENV === AppEnvironment.PRODUCTION,
        },
        // SSL configuration (optional)
        driverOptions: {
          connection: {
            ssl: {
              ca: Buffer.from(ormConfig.ORM_SERVER_CA, 'base64'),
              cert: Buffer.from(ormConfig.ORM_CLIENT_CERTIFICATE, 'base64'),
              key: Buffer.from(ormConfig.ORM_CLIENT_KEY, 'base64'),
            },
          },
        },
      }),
    }),
  ],
  providers: [ OrmConfig ],
  exports: [ OrmConfig, OrmModule ],
});
```

If you wish to change how environment variables are injected you may provide your own configuration instead of using the built-in `OrmConfig`.

We may simplify the process of adding data storage functionality as:
- Create the entity definition (table, columns and relationships)
- Create its service (repository abstraction extending provided one)
- Create its controller (extending provided one)

### Creating an Entity Definition

Please refer to the official [Defining Entities](https://mikro-orm.io/docs/defining-entities) documentation from MikroORM.

### Creating an Entity Repository

In order to create a new entity repository, extend the provided abstract repository from this package.

Then, you should call its super method passing this instance as well as an optional object with further customizations.

Example:

```ts
import { EntityManager, EntityName, OrmRepository, Repository } from '@bechara/nestjs-orm';

import { User } from './user.entity';

@Repository(User)
export class UserRepository extends OrmRepository<User> {

  public constructor(
    protected readonly entityManager: EntityManager,
    protected readonly entityName: EntityName<User>,
  ) {
    super(entityManager, entityName, {
      defaultUniqueKey: [ 'name', 'surname' ],
    });
  }

}
```

At this point, an injectable `UserRepository` will be available throughout the application, exposing extra ORM functionalities.

```ts
// Read operations
populate(): Promise<void>;
readBy(): Promise<Entity[]>;
readById(): Promise<Entity>;
readByIdOrFail(): Promise<Entity>;
readUnique(): Promise<Entity>;
readUniqueOrFail(): Promise<Entity>;
countBy(): Promise<number>;
readPaginatedBy(): Promise<OrmPaginatedResponse<Entity>>;

// Create operations
build(): Entity[];
buildOne(): Entity;
create(): Promise<Entity[]>;
createOne(): Promise<Entity>;

// Update operations
update(): Promise<Entity[]>;
updateBy(): Promise<Entity[]>;
updateById(): Promise<Entity>;
updateOne(): Promise<Entity>;
upsert(): Promise<Entity[]>;
upsertOne(): Promise<Entity>;

// Async manipulation (optional)
commit(): Promise<void>;
```

### Creating an Subscriber

If you would like to create hooks when triggering certain operations, it is possible by defining an injectable subscriber:

```ts
import { Injectable, LoggerService } from '@bechara/nestjs-core';
import { EntityManager, OrmSubscriber, OrmSubscriberParams } from '@bechara/nestjs-orm';

import { User } from './user.entity';

@Injectable()
export class UserSubscriber implements OrmSubscriber<User> {

  public constructor(
    private readonly entityManager: EntityManager,
    private readonly loggerService: LoggerService,
  ) {
    entityManager.getEventManager().registerSubscriber(this);
  }

  /**
   * Before update hook example.
   * @param params
   */
  public beforeUpdate(params: OrmSubscriberParams<User>): Promise<void> {
    const { changeSet } = params;
    this.loggerService.warning('beforeUpdate: changeSet', changeSet);
    return;
  }

}
```


### Creating an Entity Controller

Finally, expose a controller injecting your repository as dependency to allow manipulation through HTTP requests.

If you are looking for CRUD functionality you may copy exactly as the template below.

Example:

```ts
import { Body, Controller, Delete, Get, Param, Patch, Post, Put, Query } from '@bechara/nestjs-core';
import { OrmController, OrmPagination } from '@bechara/nestjs-orm';

// These DTOs are validations customized with class-validator and class-transformer
import { UserCreateDto, UserReadDto, UserUpdateDto } from './user.dto';
import { User } from './user.entity';
import { UserService } from './user.service';

@Controller('user')
export class UserController {

  public constructor(
    private readonly userRepository: UserRepository,
  ) { }

  @Get()
  public async get(@Query() query: UserReadDto): Promise<OrmPagination<User>> {
    return this.userRepository.readPaginatedBy(query);
  }

  @Get(':id')
  public async getById(@Param('id') id: string): Promise<User> {
    return this.userRepository.readByIdOrFail(id);
  }

  @Post()
  public async post(@Body() body: UserCreateDto): Promise<User> {
    return this.userRepository.createOne(body);
  }

  @Put()
  public async put(@Body() body: UserCreateDto): Promise<User> {
    return this.userRepository.upsertOne(body);
  }

  @Put(':id')
  public async putById(@Param('id') id: string, @Body() body: UserCreateDto): Promise<User> {
    return this.userRepository.updateById(id, body);
  }

  @Patch(':id')
  public async patchById(@Param('id') id: string, @Body() body: UserUpdateDto): Promise<User> {
    return this.userRepository.updateById(id, body);
  }

  @Delete(':id')
  public async deleteById(@Param('id') id: string): Promise<User> {
    return this.userRepository.deleteById(id);
  }

}
```

---

[Back to title](../../README.md)
