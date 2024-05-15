import { IsNumber, IsString } from "class-validator";
import { BaseModel } from "src/common/entity/base.entity";
import { stringValidationMessage } from "src/common/validation-message/string-validation.message";
import { UsersModel } from "src/users/entities/users.entity";
import { Column, Entity, ManyToOne, OneToMany, PrimaryGeneratedColumn } from "typeorm";
import { Transform } from "class-transformer";
import { POST_PUBLIC_IMAGE_PATH } from "src/common/const/path.const";
import {join} from 'path';
import { ImageModel, ImageModelType } from "src/common/entity/image.entity";

@Entity()
export class PostsModel extends BaseModel{

    @ManyToOne(() => UsersModel, (user) => user.posts, {
        nullable: false,
    })
    author: UsersModel;

    @Column()
    @IsString({
        message: stringValidationMessage
    })
    title: string;

    @IsString({
        message: stringValidationMessage
    })
    @Column()
    content: string;

    @Column()
    likeCount: number;

    @Column()
    commentCount: number;

    @OneToMany((type) => ImageModel, (image) => image.post)
    images?: ImageModel[];
}