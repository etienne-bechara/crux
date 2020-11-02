import { TestModule } from '../test';
import { UtilModule } from './util.module';

TestModule.createSandbox({
  name: 'UtilModule',

  descriptor: () => {
    describe('globRequire', () => {
      it('should require all modules from this project', () => {
        const modules = UtilModule.globRequire('s*rc*/**/*.module.ts');
        expect(modules.length).toBeGreaterThanOrEqual(8);
      });
    });
  },
});
