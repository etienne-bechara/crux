import { OmitType, PartialType, PickType } from '@nestjs/swagger';

import { Post } from './post.interface';

export class PostIdDto extends PickType(Post, [ 'id' ]) { }

export class PostCreateDto extends OmitType(Post, [ 'id' ]) { }

export class PostUpdateDto extends PartialType(OmitType(Post, [ 'id' ])) { }
