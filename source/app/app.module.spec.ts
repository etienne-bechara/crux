import { AppModule } from './app.module';

describe('AppModule', () => {
  describe('boot', () => {
    it('should boot the application successfully', async () => {
      const app = await AppModule.boot({ disableModuleScan: true, disableLogger: true });
      expect(app).toBeDefined();
    });
  });
});
