import { UtilModule } from './util.module';

describe('UtilModule', () => {
  describe('globRequire', () => {
    it('should require all modules from this project', () => {
      const modules = UtilModule.globRequire('s*rc*/**/*.module.ts');
      expect(modules.length).toBeGreaterThanOrEqual(8);
    });
  });
});
