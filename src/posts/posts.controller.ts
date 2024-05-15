import { Body, Controller, Delete, Get, NotFoundException, Param, ParseIntPipe, Post, Put, UseGuards, Request, Patch, Query, UseInterceptors, UploadedFile, InternalServerErrorException, BadRequestException, UseFilters } from '@nestjs/common';
import { PostsService } from './posts.service';
import { AccessTokenGuard, RefreshTokenGuard } from 'src/auth/guard/bearer-token.guard';
import { AuthService } from 'src/auth/auth.service';
import { User } from 'src/users/decoator/users.decoator';
import { UsersModel } from 'src/users/entities/users.entity';
import { CreatePostDto } from './dto/create-post.dto';
import { UpdatePostDto } from './dto/update-post.dto';
import { query } from 'express';
import { PaginatePostDto } from './dto/paginate-post.dto';
import { FileInterceptor } from '@nestjs/platform-express';
import { ImageModelType } from 'src/common/entity/image.entity';
import { QueryRunner as QR} from 'typeorm';
import { DataSource } from 'typeorm';
import { PostImagesService } from './image/images.service';
import { LogInterceptor } from 'src/common/interceptor/log.interceptor';
import { TransactionInterceptor } from 'src/common/interceptor/transaction.interceptor';
import { QueryRunner } from 'src/common/decorator/query-runner.decorator';
import { HttpExceptionFilter } from 'src/common/exception-filter/http.exception-filter';



@Controller('posts')
export class PostsController {
  constructor(
    private readonly postsService: PostsService,
    private readonly postsImageService: PostImagesService,
    private readonly dataSource: DataSource,
  ) {}

  @Get()
  @UseInterceptors(LogInterceptor)
  getPosts(
    @Query() query: PaginatePostDto,
  ) {
    return this.postsService.paginatePosts(query);
  }

  @Post('random')
  @UseGuards(AccessTokenGuard)
  async postPostRandom(
  @User() user: UsersModel
  ){
     await this.postsService.generatePost(user.id);

     return true;
  }

  @Get(':id')
  getPost(@Param('id', ParseIntPipe) id: number){
    return this.postsService.getPostByID(id);
  }

  @Post()
  @UseGuards(AccessTokenGuard)  
  @UseInterceptors(TransactionInterceptor)
  async postPosts(
    @User('id') userID: number,
    @Body() body: CreatePostDto,
    @QueryRunner() qr: QR,
    // @QueryRunner() qr: QR,
  ){    // 로직 실행

    const post =  await this.postsService.createPost(
      userID, body, qr
    );

    for(let i = 0; i < body.images.length; i++){
      await this.postsImageService.createPostImage({
        post,
        order: i,
        path: body.images[i],
        type: ImageModelType.POST_IMAGE,
      }, qr);
    }

    return this.postsService.getPostByID(post.id, qr);
  }

  @Patch(':id')
  putPost(
    @Param('id') id:string,
    @Body() body: UpdatePostDto,
    ){
      return this.postsService.updatePost(+id, body);
  }

  @Delete(':id')
  deletePost(
    @Param('id') id: string
  ){
    return this.postsService.deletePost(+id);
  }
}
