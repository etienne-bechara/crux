import { AppModule } from '../app/app.module';
import { MemoryService } from './memory.service';

describe('MemoryService', () => {
	let memoryService: MemoryService;
	const testString = 'hello world';
	const testNumber = 1_234_567_890;
	const testBuffer = Buffer.from('buffer');
	const testObject = { hello: 'world', numbers: [1, 2, 3] };
	const testArray = ['hello', 'world', 1, 2, 3, testObject];
	const testSet = ['a', 'b'];
	const testTtl = testString;
	const ttl = 2000;

	beforeAll(async () => {
		const app = await AppModule.compile({ disableAll: true });
		memoryService = app.get(MemoryService);
	});

	describe('set', () => {
		it('should successfully set storage keys', () => {
			memoryService.set('testString', testString);
			memoryService.set('testNumber', testNumber);
			memoryService.set('testBuffer', testBuffer);
			memoryService.set('testObject', testObject);
			memoryService.set('testArray', testArray);
			expect(true).toBeTruthy();
		});

		it('should skip setting existing key', () => {
			memoryService.set('foo', 'bar', { skip: 'IF_EXIST' });
			memoryService.set('foo', 'baz', { skip: 'IF_EXIST' });
			const foo = memoryService.get('foo');
			expect(foo).toBe('bar');
		});

		it('should skip setting non-existing key', () => {
			memoryService.set('non-existent', 'non-existent', { skip: 'IF_NOT_EXIST' });
			const nonExistent = memoryService.get('non-existent');
			expect(nonExistent).toBeUndefined();
		});

		it('should successfully set storage key with TTL', () => {
			memoryService.set('testTtl', testTtl, { ttl });
			expect(true).toBeTruthy();
		});

		it('should not overwrite existing key TTL', async () => {
			const delay = 1500;
			await new Promise((r) => setTimeout(r, delay));

			memoryService.set('testTtl', testTtl, { ttl });
			// biome-ignore lint/complexity/useLiteralKeys: <explanation>
			const exp = memoryService['memoryExpiration'].get('testTtl') as number;

			expect(exp - Date.now()).toBeLessThanOrEqual(ttl - delay);
		});
	});

	describe('get', () => {
		it('should successfully read storage keys', () => {
			expect(memoryService.get('testString')).toBe(testString);
			expect(memoryService.get('testNumber')).toBe(testNumber);
			expect(memoryService.get('testObject')).toBe(testObject);
			expect(memoryService.get('testArray')).toBe(testArray);
		});

		it('should read undefined for storage keys with expired TTL', async () => {
			expect(memoryService.get('testTtl')).toBe(testTtl);
			await new Promise((r) => setTimeout(r, ttl * 1.05));
			expect(memoryService.get('testTtl')).toBe(undefined);
		});
	});

	describe('getBuffer', () => {
		it('should successfully read buffer storage keys', () => {
			expect(memoryService.get('testBuffer')).toBe(testBuffer);
		});
	});

	describe('sadd', () => {
		it('should successfully add two members to a set', () => {
			memoryService.sadd('testSet', testSet[0]);
			memoryService.sadd('testSet', testSet[1]);
			expect(true).toBeTruthy();
		});
	});

	describe('smembers', () => {
		it('should successfully read members from a set', () => {
			expect(memoryService.smembers('testSet')).toStrictEqual(testSet);
		});
	});

	describe('del', () => {
		it('should successfully erase storage keys', () => {
			memoryService.del('testString');
			memoryService.del('testNumber');
			memoryService.del('testObject');
			memoryService.del('testArray');
			expect(memoryService.get('testString')).toBe(undefined);
			expect(memoryService.get('testNumber')).toBe(undefined);
			expect(memoryService.get('testObject')).toBe(undefined);
			expect(memoryService.get('testArray')).toBe(undefined);
		});
	});
});
