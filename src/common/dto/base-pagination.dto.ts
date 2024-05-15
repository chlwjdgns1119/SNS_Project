import { IsIn, IsNumber, IsOptional } from "class-validator";

export class BasePaginationDto{
    @IsNumber()
    @IsOptional()
    page?: number;
    
    @IsNumber()
    @IsOptional()
    where__id__less_than?: number;

    // 이전 마지막 데이터 id, 이 property보다 높은 ID로부터 값 가져옥;
    @IsNumber()
    @IsOptional()
    where__id__more_than?: number; //아무것도 없으면 0(처음거) 가져옴

    // 정렬
    // 생성된 날짜의 오름차 내림차를 받음
    @IsIn(['ASC', 'DESC'])
    @IsOptional()
    order__createdat?: 'ASC' | 'DESC' = 'ASC'; // 몇가지의 특수한 값들을 옵션으로 넣어줄거면 IsIn으로 list안에 값들을 넣어줄 수 있음.

    // 몇개의 데이터를 응답 받을지 정함.
    @IsNumber()
    @IsOptional()
    take: number = 20;
}