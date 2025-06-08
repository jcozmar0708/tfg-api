import { forwardRef, Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { Group, GroupSchema } from './schemas/group.schema';
import { GroupsController } from './group.controller';
import { GroupsService } from './group.service';
import { User, UserSchema } from 'src/user/schemas/user.schema';
import { EmailService } from 'src/mailer/email.service';
import { AuthModule } from 'src/auth/auth.module';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: Group.name, schema: GroupSchema },
      { name: User.name, schema: UserSchema },
    ]),
    forwardRef(() => AuthModule),
  ],
  controllers: [GroupsController],
  providers: [GroupsService, EmailService],
  exports: [GroupsService],
})
export class GroupsModule {}
