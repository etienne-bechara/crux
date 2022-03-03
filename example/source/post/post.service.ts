import { Injectable } from '@nestjs/common';

import { HttpService } from '../../../source/http/http.service';
import { PostCreateDto } from './post.dto';
import { Post } from './post.interface';

@Injectable()
export class PostService {

  public constructor(
    private readonly httpService: HttpService,
  ) { }

  /**
   * Read all posts.
   */
  public readPosts(): Promise<Post[]> {
    return this.httpService.get('posts');
  }

  /**
   * Read post by ID.
   * @param id
   */
  public readPostById(id: number): Promise<Post> {
    return this.httpService.get('posts/:id', {
      replacements: { id: id.toString() },
    });
  }

  /**
   * Create post.
   * @param params
   */
  public createPost(params: PostCreateDto): Promise<Post> {
    return this.httpService.post('posts', {
      json: params,
    });
  }

  /**
   * Replace post.
   * @param params
   */
  public replacePost(params: Post): Promise<Post> {
    const { id } = params;
    delete params.id;

    return this.updatePostById(id, params);
  }

  /**
   * Update post by ID.
   * @param id
   * @param params
   */
  public updatePostById(id: number, params: PostCreateDto): Promise<Post> {
    return this.httpService.patch('posts/:id', {
      replacements: { id: id.toString() },
      json: params,
    });
  }

  /**
   * Delete post by ID.
   * @param id
   */
  public async deletePostById(id: number): Promise<void> {
    return this.httpService.delete('posts/:id', {
      replacements: { id: id.toString() },
    });
  }

}
