import { EntityManager } from '@mikro-orm/core';
import { Injectable } from '@nestjs/common';

import { OrmSubscriberParams } from '../../source/orm/orm.interface';
import { OrmSubscriber } from '../../source/orm/orm.subscriber';
import { User } from './user.entity';

@Injectable()
export class UserSubscriber extends OrmSubscriber<User> {

  public constructor(
    protected readonly entityManager: EntityManager,
  ) {
    super(entityManager, {
      entities: User,
    });
  }

  /**
   * Truncate name if greater than 3 words.
   * @param params
   */
  public beforeCreate(params: OrmSubscriberParams<User>): void {
    const { entity } = params;
    const { name } = entity;
    const names = name.split(' ');

    if (names.length > 2) {
      entity.name = `${names[0]} ${names[names.length - 1]}`;
    }
  }

}
