import { Body, Param } from '@nestjs/common';

import { Controller, Delete, Get, Patch, Post as PostMethod, Put } from '../../../source/app/app.decorator';
import { PostCreateDto, PostIdDto } from './post.dto';
import { Post } from './post.interface';
import { PostService } from './post.service';

@Controller('post')
export class PostController {

  public constructor(
    private readonly postService: PostService,
  ) { }

  @Get('', { type: [ Post ] })
  public getPost(): Promise<Post[]> {
    return this.postService.readPosts();
  }

  @Get(':id', { type: Post })
  public getPostById(@Param() params: PostIdDto): Promise<Post> {
    const { id } = params;
    return this.postService.readPostById(id);
  }

  @PostMethod('', { type: Post })
  public postPost(@Body() body: PostCreateDto): Promise<Post> {
    return this.postService.createPost(body);
  }

  @Put('', { type: Post })
  public putPost(@Body() body: Post): Promise<Post> {
    return this.postService.replacePost(body);
  }

  @Patch(':id', { type: Post })
  public patchPostById(@Param() params: PostIdDto, @Body() body: PostCreateDto): Promise<Post> {
    const { id } = params;
    return this.postService.updatePostById(id, body);
  }

  @Delete(':id')
  public deletePostById(@Param() params: PostIdDto): Promise<void> {
    const { id } = params;
    return this.postService.deletePostById(id);
  }

}
