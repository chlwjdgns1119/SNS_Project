import { ValidationArguments } from "class-validator";

export const lengthValidationMessage = (args: ValidationArguments)=>{
    if(args.constraints.length === 2){
        return `${args.property}은 ${args.constraints[0]}~${args.constraints[1]} 사이의 값을 입력하세요.`
    }else{
        return `${args.property}은 ${args.constraints[0]} 이상의 값을 입력하세요.`
    }
}