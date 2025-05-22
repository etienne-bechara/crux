import { AppModule } from './app.module';

describe('AppModule', () => {
  console.log = jest.fn();

  describe('boot', () => {
    it('should boot the application successfully', async () => {
      const app = await AppModule.boot({ disableAll: true });
      expect(app).toBeDefined();
    });
  });

  describe('globRequire', () => {
    it('should require all modules from this project', () => {
      const modules = AppModule.globRequire('s*rc*/**/*.module.ts');
      expect(modules.length).toBe(19);
    });
  });
});
