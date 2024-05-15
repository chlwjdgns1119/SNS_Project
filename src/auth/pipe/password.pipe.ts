import { PipeTransform, ArgumentMetadata, BadRequestException, Injectable, Inject} from "@nestjs/common";

@Injectable()
export class PasswordPipe implements PipeTransform{
    transform(value: any, metadata: ArgumentMetadata) {
        if(value.toString().length > 8){
            throw new BadRequestException("비밀번호가 8자리가 넘습니다.");
        }

        return value.toString();
    }
}

@Injectable()
export class MaxLengthPipe implements PipeTransform{
    constructor(private readonly length){

    }

    transform(value: any, metadata: ArgumentMetadata) {
        if(value.toString().length > this.length){
            throw new BadRequestException(`비밀번호는 최대 ${this.length}자리 까지입니다.`);
        }

        return value.toString()
    }
}

@Injectable()
export class MinLengthPipe implements PipeTransform{
    constructor(private readonly length){

    }

    transform(value: any, metadata: ArgumentMetadata) {
        if(value.toString().length < this.length){
            throw new BadRequestException(`비밀번호는 최대 ${this.length}자리 까지입니다.`);
        }

        return value.toString()
    }
}
