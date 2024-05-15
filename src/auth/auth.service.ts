import { BadRequestException, Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { UsersModel } from 'src/users/entities/users.entity';
import { UsersService } from 'src/users/users.service';
import * as bcrypt from 'bcrypt';
import { existsSync } from 'fs';
import { of } from 'rxjs';
import { RegisterUserDto } from './dto/register-user.dto';
import { ConfigService } from '@nestjs/config';
import { ENV_HASH_ROUNDS_KEY, ENV_JWT_SECRET_KEY } from 'src/common/const/env-keys.const';

@Injectable()
export class AuthService {
    constructor(
        private readonly jwtService: JwtService,
        private readonly usersService: UsersService,
        private readonly configService: ConfigService,
    ){}
    // 만드려는 기능
    // 1). register with Email 이메일과 함께 회원가입을 한다.
    // nickname, email, password를 입력받고 사용자를 생성한다.
    // 생성이 완료되면 accessToken과 refresh Token을 반환한다.
    // 회원가입 후 다시 로그인해주세요 <- 쓸데없는 과정을 방지하기 위해서 로그인을 바로 시킬 수 있도록 설계함.

    // 2). login with email
    // email, pathword를 입력하면 사용자 검증을 진행한다.
    // 검증이 완료되면 accessToken과 refreshToken을 반환한다.

    // 3) loginUser
    // (1),(2)에서 필요한 accessToken과 refreshToken을 반환하는 로직

    // 4) signToken
    // (3)에서 필요한 accessToken과 refreshToken을 sign하는 로직

    // 5) authenticateWithEmailAndPassword
    // (2)에서 로그인을 할 때 필요한 검증 진행. 1. 사용자가 존재하는지 확인, 2. 비밀번호가 맞는지 확인. 3, 모두 통과되면 찾은 사용자 정보 반환. 4, loginWithEmail에서 반환된 데이터를
    // 기반으로 토큰 생성

    // header로부터 토큰을 받을 때 basic token을 받거나 bearer토큰을 받음.
    // {atuthorization: 'Basic {token}'}
    // {atuthorization: 'Bearer {token}'}
    
    extractTokenFromHeader(header: string, isBearer: boolean){

        const splitToken = header.split(' ');

        const prefix = isBearer ? 'Bearer' : 'Basic';

        if(splitToken.length !== 2 || splitToken[0] !== prefix){
            throw new UnauthorizedException("잘못된 토큰입니다.");
        }

        const token = splitToken[1];

        return token;
    }

    // email과 password 형태로 바꾸고 리스트 형태로 스플릿 할 거임. 그리고 {email: email, password: password} 형태로 반환할거임.
    decodeBasicToken(base64String: string){
        const decoded = Buffer.from(base64String, 'base64').toString('utf8');

        const split = decoded.split(':');

        if(split.length !== 2){
            throw new UnauthorizedException('잘못된 유형의 토큰입니다.');
        }

        const email = split[0];
        const password = split[1];

        return {
            email, 
            password
        }
    }

    // 토큰 검증
    verifyToken(token:string){
        try{
            return this.jwtService.verify(token, {
                secret: this.configService.get<string>(ENV_JWT_SECRET_KEY),
            });
        }catch(e){
            throw new UnauthorizedException('토큰이 만료됐거나 잘못된 토큰입니다.')
        }
    }

    rotateToken(token: string, isRefreshToken: boolean){
        const decoded = this.jwtService.verify(token, {
            secret: this.configService.get<string>(ENV_JWT_SECRET_KEY)
        });

        if(decoded.type !== 'refresh'){
            throw new UnauthorizedException("토큰 재발급은 refersh로만 가능합니다.");
        }

        return this.signToken({
            ...decoded,
        }, isRefreshToken);
    }

    /*
    payload에 들어갈 정보.
    1) email
    2) sub -> id 이 값을 가지고 토큰을 가지고 정보를 확인했을 때 사용자 정보를 데이터베이스에서 가져올 것임.
    3) type을 넣을 거임. accessToken인지 refresh Token인지.
    */
    signToken(user: Pick<UsersModel, 'email' | 'id'>, isRefreshToken: boolean){
        const payload = {
            email: user.email,
            sub: user.id,
            type: isRefreshToken ? 'refresh' : 'access',
        }

        return this.jwtService.sign(payload, {
            secret: this.configService.get<string>(ENV_JWT_SECRET_KEY),
            expiresIn: isRefreshToken ? 3600 : 300, 
        })
    }

    async loginUser(user: Pick<UsersModel, 'email' | 'id'> ){
        return {
            accessToken: this.signToken(user, false),
            refreshToken: this.signToken(user, true),
        }
    }

    async authenticateWithEmailAndPassword(user: Pick<UsersModel, 'email' | 'password'>){
        const exsitingUser = await this.usersService.getUserByEmail(user.email);

        if(!exsitingUser){
            throw new UnauthorizedException("존재하지 않는 사용자입니다.");
        }

        const passOk = await bcrypt.compare(user.password, exsitingUser.password);

        if(!passOk){
            throw new UnauthorizedException("비밀번호가 틀렸습니다.");
        }

        return exsitingUser;
    }

    async loginWithEmail(user: Pick<UsersModel, 'email' | 'password'>){
        const exsitingUser = await this.authenticateWithEmailAndPassword(user);

        return this.loginUser(exsitingUser)
    }

    async registerWithEmail(user: RegisterUserDto){
        const hash = await bcrypt.hash(
            user.password,
            parseInt(this.configService.get<string>(ENV_HASH_ROUNDS_KEY)),
        );

        const newUser = await this.usersService.createUser({
            ...user,
            password: hash,
        });
        return this.loginUser(newUser);
    }
    
}
