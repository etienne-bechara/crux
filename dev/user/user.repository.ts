import { OrmRepository } from '../../source/orm/orm.repository';
import { EntityManager, EntityName } from '../../source/override';
import { User } from './user.entity';

export class UserRepository extends OrmRepository<User> {
	public constructor(
		protected readonly entityManager: EntityManager,
		protected readonly entityName: EntityName<User>,
	) {
		super(entityManager, entityName, {
			defaultUniqueKey: ['email'],
		});
	}
}
