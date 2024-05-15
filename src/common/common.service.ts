import { BadRequestException, Injectable } from '@nestjs/common';
import { BaseModel } from './entity/base.entity';
import { BasePaginationDto } from './dto/base-pagination.dto';
import { FindManyOptions, FindOptions, FindOptionsOrder, FindOptionsWhere, LessThan, MoreThan, Repository } from 'typeorm';
import { FILTER_MAPPER } from './const/filter-mapper.const';
import { countReset } from 'console';
import { ConfigService } from '@nestjs/config';
import { ENV_HOST_KEY, ENV_PROTOCOL_KEY } from './const/env-keys.const';

@Injectable()
export class CommonService {
    constructor(
        private readonly configService: ConfigService,
    ){}

    paginate<T extends BaseModel>(
        dto: BasePaginationDto,
        repoisitory: Repository<T>,
        overrideFindOptions: FindManyOptions<T> = {},
        path: string,
    ){
        if(dto.page){
            return this.pagePaginate(
                dto,
                repoisitory,
                overrideFindOptions,
            );
        }
        else{
            return this.cursorPaginate(
                dto,
                repoisitory,
                overrideFindOptions,
                path,
            );
        }
    }

    private async pagePaginate<T extends BaseModel>(
        dto: BasePaginationDto,
        repository: Repository<T>,
        overrideFindOptions: FindManyOptions<T> = {},
    ){
        const findOptions = this.composeFindOptions<T>  (dto);

        const [results, count] = await repository.findAndCount({
            ...findOptions,
            ...overrideFindOptions,
        })

        return {
            data: results,
            total: count,
        }

    }

    private async cursorPaginate<T extends BaseModel>(
        dto: BasePaginationDto,
        repository: Repository<T>,
        overrideFindOptions: FindManyOptions<T> = {},
        path: string,
    ){
        const findOptions = this.composeFindOptions<T>(dto);

        const results = await repository.find({
            ...findOptions,
            ...overrideFindOptions,
        })

        const lastItem = results.length > 0 && results.length === dto.take ? results[results.length -1] : null;
        
        const protocol = this.configService.get<string>(ENV_PROTOCOL_KEY);
        const host = this.configService.get<string>(ENV_HOST_KEY);

        const nextURL = lastItem && new URL(`${protocol}://${host}/${path}`);

        if(nextURL){
            for(const key of Object.keys(dto)){
            if(dto[key]){
                if(key !== 'where__id__more_than' && key !== 'where__id__less_than'){
                nextURL.searchParams.append(key, dto[key]);
                }
            }
            }   
        
        let key = null;

        if(dto.order__createdat === 'ASC'){
          key = 'where__id__more_than';
        }
        else{
          key = 'where__id__less_than';
        }

        nextURL.searchParams.append(key, lastItem.id.toString());
      }

      return{
        data: results,
        cursor: {
            after: lastItem?.id ?? null,
        },
        count: results.length,
        next: nextURL?.toString() ?? null,
        }
    }

    private composeFindOptions<T extends BaseModel>(
        dto: BasePaginationDto,
    ) : FindManyOptions<T>{
        let where: FindOptionsWhere<T> = {};
        let order: FindOptionsOrder<T> = {};

        for(const [key, value] of Object.entries(dto)){
            if(key.startsWith("where__")){
                where = {
                    ...where,
                    ...this.parseWhereFilter(key, value),
                }
            }
            else if(key.startsWith("order__")){
                order = {
                    ...order,
                    ...this.parseOrderFilter(key, value),
                }
            }
        }

        return {
            where,
            order,
            take: dto.take,
            skip: dto.page ? dto.take * (dto.page - 1) : null,
        }
    }

    private parseWhereFilter<T extends BaseModel>(key: string, value: string) : 
        FindOptionsWhere<T>  | FindOptionsOrder<T>{
        const options: FindOptionsWhere<T> = {};
        const split = key.split("__");

        if(split.length !== 2 && split.length !== 3){
            throw new BadRequestException(
            `where 필터는 '__'으로 split 했을 때 길이가 2 또는 3이어야 합니다. 문제되는 키 값: ${key}`
        )}
        
        if(split.length === 2){
            const [_, field] = split;

            options[field] = value;
        }
        else{
            const [_, field, operator] = split;

            const values = value.toString().split(',')

            
            
            if(operator === 'i_like'){
                options[field] = FILTER_MAPPER[operator](`%${value}%`);
            }
            else{
                options[field] = FILTER_MAPPER[operator](value);
            }
        }
        return options;
    }

    private parseOrderFilter<T extends BaseModel>(key: string, value: string) :
        FindOptionsOrder<T>{
        const order: FindOptionsOrder<T> = {};

        const split = key.split("__");

        if(split.length !== 2){
            throw new BadRequestException(
                `order 필터는 '__'으로 split 했을 때 길이가 2 또는 3이어야 합니다. 문제되는 키 값: ${key}`
        )}
        
        const [_, field] = split;

        order[field] = value;

        return order;
    }

}
