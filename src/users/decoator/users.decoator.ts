import { createParamDecorator, ExecutionContext, InternalServerErrorException } from "@nestjs/common";
import { UsersModel } from "../entities/users.entity";

export const User = createParamDecorator((data: keyof UsersModel | undefined, context: ExecutionContext) => {
    const req = context.switchToHttp().getRequest();

    const user = req.user as UsersModel;

    if(!user){
        throw new InternalServerErrorException('AccessTokenGuard를 사용 안 한 것 같습니다. Request에 user프로퍼티가 존재하지 않습니다.')
    }
    
    if(data){
        return user[data];
    }

    return user;
})