import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { User } from './schemas/user.schema';
import { Model } from 'mongoose';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';

@Injectable()
export class UsersService {
  constructor(
    @InjectModel(User.name) private readonly userModel: Model<User>,
  ) {}

  async findAll(): Promise<User[]> {
    return await this.userModel.find().exec();
  }

  async findOne(uuid: string): Promise<User> {
    const user = await this.userModel.findById(uuid).exec();

    if (!user) {
      throw new NotFoundException(`User with uuid ${uuid} not found`);
    }

    return user;
  }

  async create(createUserDto: CreateUserDto): Promise<User> {
    const newUser = new this.userModel(createUserDto);
    return await newUser.save();
  }

  async update(uuid: string, updateUserDto: UpdateUserDto): Promise<User> {
    const updatedUser = await this.userModel.findByIdAndUpdate(
      uuid,
      updateUserDto,
      {
        new: true,
      },
    );

    if (!updatedUser) {
      throw new NotFoundException(`User with uuid ${uuid} not found`);
    }

    return updatedUser;
  }
}

// TODO: Seguir haciendo el service
