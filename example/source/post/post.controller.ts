import { Body, Controller, Delete, Get, Param, Patch, Post as PostMethod, Put } from '@nestjs/common';
import { ApiCreatedResponse, ApiNoContentResponse, ApiOkResponse, ApiTags } from '@nestjs/swagger';

import { PostCreateDto, PostIdDto } from './post.dto';
import { Post } from './post.interface';
import { PostService } from './post.service';

@ApiTags('Post')
@Controller('post')
export class PostController {

  public constructor(
    private readonly postService: PostService,
  ) { }

  @Get()
  @ApiOkResponse({ type: [ Post ] })
  public getPost(): Promise<Post[]> {
    return this.postService.readPosts();
  }

  @Get(':id')
  @ApiOkResponse({ type: Post })
  public getPostById(@Param() params: PostIdDto): Promise<Post> {
    const { id } = params;
    return this.postService.readPostById(id);
  }

  @PostMethod()
  @ApiCreatedResponse({ type: Post })
  public postPost(@Body() body: PostCreateDto): Promise<Post> {
    return this.postService.createPost(body);
  }

  @Put()
  @ApiOkResponse({ type: Post })
  public putPost(@Body() body: Post): Promise<Post> {
    return this.postService.replacePost(body);
  }

  @Patch(':id')
  @ApiOkResponse({ type: Post })
  public patchPostById(@Param() params: PostIdDto, @Body() body: PostCreateDto): Promise<Post> {
    const { id } = params;
    return this.postService.updatePostById(id, body);
  }

  @Delete(':id')
  @ApiNoContentResponse()
  public deletePostById(@Param() params: PostIdDto): Promise<void> {
    const { id } = params;
    return this.postService.deletePostById(id);
  }

}
