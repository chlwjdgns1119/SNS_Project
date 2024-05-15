import { Column, CreateDateColumn, Entity, OneToMany, PrimaryColumn, PrimaryGeneratedColumn, UpdateDateColumn } from "typeorm";
import { RolesEnum } from "../const/roles.const";
import { PostsModel } from "src/posts/entities/posts.entity";
import { BaseModel } from "src/common/entity/base.entity";
import { IsEmail, IsString, Length, ValidationArguments } from "class-validator";
import { lengthValidationMessage } from "src/common/validation-message/length-validation.message";
import { stringValidationMessage } from "src/common/validation-message/string-validation.message";
import { emailValidationMessage } from "src/common/validation-message/email-validation.message";
import { Exclude, Expose } from "class-transformer";

@Entity()
export class UsersModel extends BaseModel{

    // 길이가 20이 넘지 않을것
    // 유일무이할 것
    @Column({
        length: 20,
        unique: true
    })
    @IsString({
        message: stringValidationMessage,
    })
    @Length(1, 20, {
        message: lengthValidationMessage
    })
    nickname: string;

    // 유일무이한 값이 될 것
    @Column({
        unique: true
    })
    @IsString({
        message: stringValidationMessage,
    })
    @IsEmail({}, {
        message: emailValidationMessage
    })
    email: string;

    @Column()
    @IsString({
        message: stringValidationMessage,
    })
    @Length(3, 8, {
        message: lengthValidationMessage
    })
    @Exclude({
        toPlainOnly: true,
    })
    password: string;

    @Column({
        enum: Object.values(RolesEnum),
        default: RolesEnum.User,      
    })
    role: RolesEnum;

    @OneToMany(() => PostsModel, (post) => post.author, {
        nullable: false,
    })
    posts: PostsModel[];
}