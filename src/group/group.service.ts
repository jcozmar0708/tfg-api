import {
  Injectable,
  NotFoundException,
  ForbiddenException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Group } from './schemas/group.schema';
import * as crypto from 'crypto';
import { AddUsersDto } from './dto/add-users.dto';
import { CreateGroupDto } from './dto/create-group.dto';
import { User } from 'src/user/schemas/user.schema';
import { EmailService } from 'src/mailer/email.service';
import { NameOnlyDto } from './dto/name-only.dto';

@Injectable()
export class GroupsService {
  constructor(
    @InjectModel(Group.name) private readonly groupModel: Model<Group>,
    @InjectModel(User.name) private readonly userModel: Model<User>,
    private readonly emailService: EmailService,
  ) {}

  private generateInviteCode(): string {
    return crypto.randomBytes(4).toString('hex').toUpperCase();
  }

  async createGroup(body: CreateGroupDto, creator: string): Promise<Group> {
    const inviteCode = this.generateInviteCode();

    const group = new this.groupModel({
      name: body.name,
      creator: creator,
      users: [creator],
      inviteCode,
    });

    await group.save();

    const invitedEmails = (body.emails ?? []).filter(
      (email) => email && email.trim() !== '' && email !== creator,
    );

    for (const email of invitedEmails) {
      await this.emailService.sendGroupInvitationEmail(
        email,
        group.name,
        inviteCode,
        creator,
      );
    }

    return group;
  }

  async getUserGroups(userEmail: string): Promise<Group[]> {
    return this.groupModel.find({ users: userEmail }).exec();
  }

  async getGroupById(groupUUID: string): Promise<any> {
    const group = await this.groupModel.findById(groupUUID);
    if (!group) throw new NotFoundException('Grupo no encontrado');

    const users = await this.userModel.find(
      { email: { $in: group.users } },
      { fullName: 1, email: 1, _id: 0 },
    );

    return {
      uuid: group._id,
      name: group.name,
      creator: group.creator,
      inviteCode: group.inviteCode,
      users,
    };
  }

  async addUserToGroupByInviteCode(
    userEmail: string,
    code: string,
  ): Promise<Group> {
    const group = await this.groupModel.findOne({ inviteCode: code });
    if (!group) throw new NotFoundException('Código de invitación no válido');

    if (!group.users.includes(userEmail)) {
      group.users.push(userEmail);
      await group.save();
    }
    return group;
  }

  async addUsersToGroup(
    groupUUID: string,
    currentUserEmail: string,
    body: AddUsersDto,
  ): Promise<{ sent: string[] }> {
    const group = await this.groupModel.findById(groupUUID);
    if (!group) throw new NotFoundException('Grupo no encontrado');

    if (group.creator !== currentUserEmail)
      throw new ForbiddenException('Solo el creador puede añadir usuarios');

    const sentInvitations: string[] = [];

    for (const email of body.emails) {
      if (!group.users.includes(email)) {
        await this.emailService.sendGroupInvitationEmail(
          email,
          group.name,
          group.inviteCode,
          currentUserEmail,
        );

        sentInvitations.push(email);
      }
    }
    return { sent: sentInvitations };
  }

  async updateGroupName(
    groupUUID: string,
    currentUserEmail: string,
    body: NameOnlyDto,
  ) {
    const group = await this.groupModel.findById(groupUUID);

    if (!group) throw new NotFoundException('Grupo no encontrado');

    if (group.creator !== currentUserEmail)
      throw new ForbiddenException('Solo el creador puede modificar el grupo');

    group.name = body.name;
    await group.save();

    return group;
  }

  async removeUserFromGroup(
    groupUUID: string,
    currentUserEmail: string,
    userEmailToRemove: string,
  ): Promise<boolean> {
    const group = await this.groupModel.findById(groupUUID);

    if (!group) throw new NotFoundException('Grupo no encontrado');

    if (currentUserEmail === userEmailToRemove) {
      if (group.creator === currentUserEmail) {
        await this.groupModel.findByIdAndDelete(groupUUID);
        return true;
      }

      group.users = group.users.filter((email) => email !== userEmailToRemove);
      await group.save();

      return true;
    }

    if (group.creator !== currentUserEmail)
      throw new ForbiddenException('Solo el creador puede eliminar usuarios');

    group.users = group.users.filter((email) => email !== userEmailToRemove);
    await group.save();

    return true;
  }
}
