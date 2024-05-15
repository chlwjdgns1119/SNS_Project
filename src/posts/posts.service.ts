import { BadRequestException, Inject, Injectable, NotFoundException } from '@nestjs/common';
import { PostsModel } from './entities/posts.entity';
import { FindOptionsWhere, LessThan, MoreThan, QueryRunner, Repository} from 'typeorm';
import { InjectRepository } from '@nestjs/typeorm';
import { UsersModel } from 'src/users/entities/users.entity';
import { CreatePostDto } from './dto/create-post.dto';
import { UpdatePostDto } from './dto/update-post.dto';
import { PaginatePostDto } from './dto/paginate-post.dto';
import { CommonService } from 'src/common/common.service';
import { ConfigService } from '@nestjs/config';
import { ENV_HOST_KEY, ENV_PROTOCOL_KEY } from 'src/common/const/env-keys.const';
import { POSTS_FOLDER_NAME, POST_PUBLIC_IMAGE_PATH, PUBLIC_FOLDER_PATH, TEMP_FOLDER_PATH } from 'src/common/const/path.const';
import { basename, join } from 'path';
import {promises} from 'fs'; 
import { createPostImageDto } from './image/dto/create-image.dto';
import { ImageModel } from 'src/common/entity/image.entity';
import { DEFAULT_POST_FIND_OPTIONS } from './const/default-const-find-options.const';

@Injectable()
export class PostsService {
    constructor(
      @InjectRepository(PostsModel)
      private readonly postsRepository: Repository<PostsModel>,
      @InjectRepository(ImageModel)
      private readonly imageRepository: Repository<ImageModel>,
      private readonly commonService: CommonService,
      private readonly configService: ConfigService,
    ){}

    async getAllPosts(){
      return this.postsRepository.find({
        ...DEFAULT_POST_FIND_OPTIONS,
      });
    }

    async paginatePosts(dto: PaginatePostDto){

      return this.commonService.paginate(
        dto,
        this.postsRepository,
        {
          ...DEFAULT_POST_FIND_OPTIONS,
        },
        'posts',
      );
/*       if(dto.page){
        return this.pagePaginatePosts(dto);
      }
      else{
        return this.cursorPaginatePosts(dto);
      } */
    }

    async pagePaginatePosts(dto: PaginatePostDto){
      const [posts, count] = await this.postsRepository.findAndCount({
        skip: dto.take*(dto.page - 1),
        order: {
          createdat: dto.order__createdat,
        },
        take: dto.take,
      })

      return {
        data: posts,
        total: count,
      }
    }

    async cursorPaginatePosts(dto: PaginatePostDto){
      const where : FindOptionsWhere<PostsModel> = {};

      if(dto.where__id__less_than){
        where.id = LessThan(dto.where__id__less_than);
      }
      else if(dto.where__id__more_than){
        where.id = MoreThan(dto.where__id__more_than);
      }


      const posts = await this.postsRepository.find({
        where,
        order: {
          createdat: dto.order__createdat,
        },
        take: dto.take,
      });

      // 포스트가 0개 이상이면 마지막 포스트 가져오고 아니면 null 반환함.
      const lastItem = posts.length > 0 && posts.length === dto.take ? posts[posts.length -1] : null;
      
      const protocol = this.configService.get<string>(ENV_PROTOCOL_KEY);
      const host = this.configService.get<string>(ENV_HOST_KEY);

      const nextURL = lastItem && new URL(`${protocol}://${host}/posts`);

      if(nextURL){
        for(const key of Object.keys(dto)){
          if(dto[key]){
            if(key !== 'where__id__more_than' && key !== 'where__id__less_than'){
              nextURL.searchParams.append(key, dto[key]);
            }
          }
        }
        
        let key = null;

        if(dto.order__createdat === 'ASC'){
          key = 'where__id__more_than';
        }
        else{
          key = 'where__id__less_than';
        }

        nextURL.searchParams.append(key, lastItem.id.toString());

      }

      return {
        data: posts,
        cursor: {
          after: lastItem?.id ?? null,
        },
        count: posts.length,
        next: nextURL?.toString() ?? null,
      }
    }

    async generatePost(userId: number){
      for(let i = 0; i < 100; i++){
        await this.createPost(userId, {
          title: `임의로 생성된 포스트 제목 ${i}`,
          content: `임의로 생성된 포스트 내용 ${i}`,
          images: [],
        });
      }
    }

    async getPostByID(id: number, qr?: QueryRunner){
      const repository = this.getRepository(qr);

      const post = await repository.findOne({
        ...DEFAULT_POST_FIND_OPTIONS,
        where:{
          id,
        },
      });

      if(!post){
        throw new NotFoundException();
      }
      
      return post;
    }

    getRepository(qr?: QueryRunner){
      return qr ? qr.manager.getRepository<PostsModel>(PostsModel) : this.postsRepository;
    }

    async createPost(authorID: number, postDto: CreatePostDto, qr?: QueryRunner){

      const repository = this.getRepository(qr);

      const post = repository.create({
        author: {
          id: authorID,
        },
        ...postDto,
        images: [],
        likeCount: 0,
        commentCount: 0,
      });

      await repository.save(post);
      
      return post;
    }

    async updatePost(postid: number, postDto: UpdatePostDto){

      const {title, content, likeCount} = postDto
      
        const post = await this.postsRepository.findOne({
          where:{
            id: postid,
          },
        });

      if(!post){
        throw new NotFoundException();
      }

      if(title){
        post.title = title;
      }

      if(content){
        post.content = content;
      }

      if(likeCount){
        post.likeCount = likeCount;
      }

      const newPost = await this.postsRepository.save(post);

      return newPost;
    }

    async deletePost(postid: number){
      const post = await this.postsRepository.findOne({
        where:{
          id: postid,
        },
      });
      
      if(!post){
        throw new NotFoundException();
      }

      await this.postsRepository.delete(postid);

      return postid;
    }
}
