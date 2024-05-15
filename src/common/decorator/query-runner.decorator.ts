import { ExecutionContext, InternalServerErrorException, createParamDecorator } from "@nestjs/common";

export const QueryRunner = createParamDecorator(
    (data, context: ExecutionContext) => {
    const req = context.switchToHttp().getRequest();

    if(!req.queryRunner){
        throw new InternalServerErrorException('transaction interceptor를 먼저 적용해야합니다.');
    }

    return req.queryRunner;
})