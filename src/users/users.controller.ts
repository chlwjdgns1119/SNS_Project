import { Body, ClassSerializerInterceptor, Controller, Get, Post, UseInterceptors } from '@nestjs/common';
import { UsersService } from './users.service';
import { UsersModel } from './entities/users.entity';

@Controller('users')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

/*   @Post()
  postUser(
    @Body('nickname') nickname: string,
    @Body('email') email: string,
    @Body('password') password: string,
  ){
    return this.usersService.createUser({
      email,
      nickname,
      password,
    }); 
  } */

  @Get()
  getusers(){
    return this.usersService.getAllUsers();
  }


}

