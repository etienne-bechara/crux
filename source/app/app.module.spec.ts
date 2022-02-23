import { AppModule } from './app.module';

describe('AppModule', () => {
  // eslint-disable-next-line no-console
  console.log = jest.fn();

  describe('boot', () => {
    it('should boot the application successfully', async () => {
      const app = await AppModule.boot({ disableScan: true, disableLogger: true });
      expect(app).toBeDefined();
    });
  });

  describe('globRequire', () => {
    it('should require all modules from this project', () => {
      const modules = AppModule.globRequire('s*rc*/**/*.module.ts');
      expect(modules.length).toBe(11);
    });
  });
});
