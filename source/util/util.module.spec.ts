import { UtilModule } from './util.module';

describe('UtilModule', () => {
  // eslint-disable-next-line no-console
  console.log = jest.fn();

  describe('globRequire', () => {
    it('should require all modules from this project', () => {
      const modules = UtilModule.globRequire('s*rc*/**/*.module.ts');
      expect(modules.length).toBe(11);
    });
  });
});
