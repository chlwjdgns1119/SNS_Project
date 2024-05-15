import { BadRequestException, Injectable } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { basename, join } from "path";
import { POST_PUBLIC_IMAGE_PATH, TEMP_FOLDER_PATH } from "src/common/const/path.const";
import { ImageModel } from "src/common/entity/image.entity";
import { QueryRunner, Repository } from "typeorm";
import { createPostImageDto } from "./dto/create-image.dto";
import { promises } from "fs";

@Injectable()
export class PostImagesService{
    constructor(
        @InjectRepository(ImageModel)
        private readonly imageRepository: Repository<ImageModel>,
    ){

    }

    getRepository(qr?: QueryRunner){
        return qr ? qr.manager.getRepository<ImageModel>(ImageModel) : this.imageRepository;
      }

    async createPostImage(dto: createPostImageDto, qr?: QueryRunner){

        const repository = this.getRepository(qr);

            //dto 이미지 이름 기반으로 파일 경로 생성함.
        const tempFilePath = join(
            TEMP_FOLDER_PATH,
            dto.path,
        );
        
        try{
            // 파일 있는지 확인 해볼 거임. 없으면 err를 던짐.
            await promises.access(tempFilePath);
        }catch(e){
            throw new BadRequestException("존재하지 않는 파일입니다.")
        }

        // 파일의 이름만 가져옴, 새로 이동할   포스트 폴더 경로랑 이름 만들기 위해서 사용
        const fileName = basename(tempFilePath);

        const newPath = join(
            POST_PUBLIC_IMAGE_PATH,
            fileName,
        )

        // save
        const result = await repository.save({
            ...dto,
        });

        await promises.rename(tempFilePath, newPath);

        return result;
    }
}