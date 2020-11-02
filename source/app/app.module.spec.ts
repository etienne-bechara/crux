
import { TestModule } from '../test';
import { AppModule } from './app.module';

TestModule.createSandbox({
  name: 'AppModule',

  descriptor: () => {
    describe('bootServer', () => {
      it('should boot the application successfully', async () => {
        await AppModule.bootServer();
        expect(true).toBeDefined();
      });
    });
  },

});
