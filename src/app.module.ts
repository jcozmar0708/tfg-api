import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { ConfigModule } from '@nestjs/config';
import { UsersService } from './user/user.service';
import { UsersController } from './user/user.controller';
import { UsersModule } from './user/user.module';
import { GroupsService } from './group/group.service';
import { GroupsController } from './group/group.controller';
import { GroupsModule } from './group/group.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      envFilePath: '.env',
      isGlobal: true,
    }),
    MongooseModule.forRoot(process.env.MONGODB_URI ?? ''),
    UsersModule,
    GroupsModule,
  ],
  providers: [UsersService, GroupsService],
  controllers: [UsersController, GroupsController],
})
export class AppModule {}
