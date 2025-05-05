import { Body, Controller, Get, Param, Patch, Post } from '@nestjs/common';
import { UsersService } from './user.service';
import { CreateUserDto } from './dto/create-user.dto';
import { User } from './schemas/user.schema';
import { UpdateUserDto } from './dto/update-user.dto';

@Controller('users')
export class UsersController {
  constructor(private readonly userService: UsersService) {}

  @Get()
  async findAll(): Promise<User[]> {
    return await this.userService.findAll();
  }

  @Get(':uuid')
  async findOne(@Param('uuid') uuid: string): Promise<User> {
    return await this.userService.findOne(uuid);
  }

  @Post()
  async create(@Body() createUserDto: CreateUserDto): Promise<User> {
    return await this.userService.create(createUserDto);
  }

  @Patch(':uuid')
  async update(
    @Param('uuid') uuid: string,
    @Body() updateUserDto: UpdateUserDto,
  ) {
    return await this.userService.update(uuid, updateUserDto);
  }
}

// TODO: Seguir haciendo el controller
