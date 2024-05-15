import { BadRequestException, Injectable } from '@nestjs/common';
import { INJECTABLE_WATERMARK } from '@nestjs/common/constants';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { UsersModel } from './entities/users.entity';

@Injectable()
export class UsersService {
    constructor(
        @InjectRepository(UsersModel)
        private readonly usersRepository: Repository<UsersModel>,
    ){}

    async createUser(user: Pick<UsersModel, 'email' | 'nickname' | 'password'>){
        // 1) 닉네임 중복이 있는지 확인.
        const nicknameExists = await this.usersRepository.exists({
            where: {
                nickname: user.nickname,
            }
        });

        if(nicknameExists){
            throw new BadRequestException('이미 존재하는 닉네임입니다.');
        }

        const emailExists = await this.usersRepository.exists({
            where: {
                email: user.email,
            }
        });

        if(emailExists){
            throw new BadRequestException('이미 존재하는 이메일입니다.');
        }

        const userObject = this.usersRepository.create({
            nickname: user.nickname,
            email: user.email,
            password: user.password,
        })

        const newUser = await this.usersRepository.save(userObject);

        return newUser;
    }

    async getAllUsers(){
        return this.usersRepository.find();
    }

    async getUserByEmail(email: string){
        return this.usersRepository.findOne({
            where: {
                email,
            }
        })
    }
}
