import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Group } from './schemas/group.schema';
import { Model } from 'mongoose';
import { CreateGroupDto } from './dto/create-group.dto';
import { UpdateGroupDto } from './dto/update-group.dto';

@Injectable()
export class GroupsService {
  constructor(
    @InjectModel(Group.name) private readonly groupModel: Model<Group>,
  ) {}

  async findAll(): Promise<Group[]> {
    return await this.groupModel.find().exec();
  }

  async findOne(uuid: string): Promise<Group> {
    const group = await this.groupModel.findById(uuid).exec();

    if (!group) {
      throw new NotFoundException(`Group with uuid ${uuid} not found`);
    }

    return group;
  }

  async create(createGroupDto: CreateGroupDto): Promise<Group> {
    const newGroup = new this.groupModel(createGroupDto);
    return await newGroup.save();
  }

  async update(uuid: string, updateGroupDto: UpdateGroupDto): Promise<Group> {
    const updatedGroup = await this.groupModel.findByIdAndUpdate(
      uuid,
      updateGroupDto,
      {
        new: true,
      },
    );

    if (!updatedGroup) {
      throw new NotFoundException(`Group with uuid ${uuid} not found`);
    }

    return updatedGroup;
  }

  async delete(uuid: string): Promise<Group> {
    const deletedGroup = await this.groupModel.findByIdAndDelete(uuid);

    if (!deletedGroup) {
      throw new NotFoundException(`Group with uuid ${uuid} not found`);
    }

    return deletedGroup;
  }
}

// TODO: Seguir haciendo el service
