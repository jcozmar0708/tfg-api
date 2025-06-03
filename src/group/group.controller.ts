import {
  Controller,
  Post,
  Body,
  Get,
  Param,
  UseGuards,
  Req,
  Delete,
  Patch,
} from '@nestjs/common';
import { GroupsService } from './group.service';
import { JwtAuthGuard } from 'src/auth/jwt/jwt-auth.guard';
import { CreateGroupDto } from './dto/create-group.dto';
import { AddUsersDto } from './dto/add-users.dto';
import { NameOnlyDto } from './dto/name-only.dto';

@Controller('groups')
@UseGuards(JwtAuthGuard)
export class GroupsController {
  constructor(private readonly groupService: GroupsService) {}

  @Get()
  async getUserGroups(@Req() req) {
    return this.groupService.getUserGroups(req.user.email);
  }

  @Get(':uuid')
  async getGroupDetail(@Param('uuid') uuid: string) {
    return this.groupService.getGroupById(uuid);
  }

  @Post()
  async createGroup(@Req() req, @Body() body: CreateGroupDto) {
    return this.groupService.createGroup(body, req.user.email);
  }

  @Post('join/:code')
  async joinGroupByInviteCode(@Req() req, @Param('code') code: string) {
    return this.groupService.addUserToGroupByInviteCode(req.user.email, code);
  }

  @Post(':uuid/add-user')
  async addUserToGroup(
    @Param('uuid') groupUUID: string,
    @Req() req,
    @Body() body: AddUsersDto,
  ) {
    return this.groupService.addUsersToGroup(groupUUID, req.user.email, body);
  }

  @Patch(':uuid')
  async updateGroupName(
    @Param('uuid') groupUUID: string,
    @Req() req,
    @Body() body: NameOnlyDto,
  ) {
    return this.groupService.updateGroupName(groupUUID, req.user.email, body);
  }

  @Delete(':uuid/remove-user/:email')
  async removeUser(
    @Param('uuid') uuid: string,
    @Param('email') email: string,
    @Req() req,
  ) {
    return this.groupService.removeUserFromGroup(uuid, req.user.email, email);
  }
}
