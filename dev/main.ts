import { MySqlDriver } from '@mikro-orm/mysql';

import { AppModule } from '../source/app/app.module';
import { ConfigModule } from '../source/config/config.module';
import { OrmModule } from '../source/orm/orm.module';
import { RandomModule } from './random/random.module';
import { User } from './user/user.entity';
import { UserModule } from './user/user.module';
import { ZipModule } from './zip/zip.module';

const grafanaApiKey = ConfigModule.get('GRAFANA_API_KEY');

/**
 * Run with `pnpm dev`, requires docker.
 *
 * Boots an example application including ORM and telemetry
 * functionalities, it points directly to source files which
 * enables live reload support.
 *
 * Telemetry can be debugged using a free Grafana Cloud account:
 * https://grafana.com/.
 */
void AppModule.boot({
	disableScan: true,
	name: 'crux',
	loki: {
		url: 'https://logs-prod-024.grafana.net/loki/api/v1/push',
		pushInterval: 5000,
		username: '1132369',
		password: grafanaApiKey,
	},
	metrics: {
		url: 'https://prometheus-prod-40-prod-sa-east-1.grafana.net/api/prom/push',
		pushInterval: 5000,
		username: '2273383',
		password: grafanaApiKey,
	},
	traces: {
		url: 'https://tempo-prod-17-prod-sa-east-1.grafana.net/tempo',
		pushInterval: 5000,
		username: '1126684',
		password: grafanaApiKey,
	},
	docs: {
		tagGroups: [
			{ name: 'User Management', tags: ['User'] },
			{ name: 'ZIP Code', tags: ['ZIP'] },
		],
	},
	imports: [
		UserModule,
		RandomModule,
		ZipModule,
		OrmModule.registerAsync({
			disableEntityScan: true,
			entities: [User],
			useFactory: () => ({
				driver: MySqlDriver,
				host: 'localhost',
				port: 3306,
				dbName: 'crux',
				user: 'root',
				password: 'password',
				sync: { auto: true },
			}),
		}),
	],
	exports: [OrmModule],
});
