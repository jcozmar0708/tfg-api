import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
} from '@nestjs/common';
import { GroupsService } from './group.service';
import { Group } from './schemas/group.schema';
import { CreateGroupDto } from './dto/create-group.dto';
import { UpdateGroupDto } from './dto/update-group.dto';

@Controller('groups')
export class GroupsController {
  constructor(private readonly groupService: GroupsService) {}

  @Get()
  async findAll(): Promise<Group[]> {
    return await this.groupService.findAll();
  }

  @Get(':uuid')
  async findOne(@Param('uuid') uuid: string): Promise<Group> {
    return await this.groupService.findOne(uuid);
  }

  @Post()
  async create(@Body() createGroupDto: CreateGroupDto): Promise<Group> {
    return await this.groupService.create(createGroupDto);
  }

  @Patch(':uuid')
  async update(
    @Param('uuid') uuid: string,
    @Body() updateGroupDto: UpdateGroupDto,
  ) {
    return await this.groupService.update(uuid, updateGroupDto);
  }

  @Delete(':uuid')
  async delete(@Param('uuid') uuid: string) {
    return await this.groupService.delete(uuid);
  }
}

// TODO: Seguir haciendo el controller
