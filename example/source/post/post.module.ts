import { Module } from '@nestjs/common';

import { HttpModule } from '../../../source/http/http.module';
import { PostController } from './post.controller';
import { PostService } from './post.service';

@Module({
  imports: [
    HttpModule.register({
      prefixUrl: 'https://jsonplaceholder.typicode.com',
      resolveBodyOnly: true,
      responseType: 'json',
    }),
  ],
  controllers: [
    PostController,
  ],
  providers: [
    PostService,
  ],
  exports: [
    PostService,
  ],
})
export class PostModule { }
