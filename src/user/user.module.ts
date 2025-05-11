import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { User, UserSchema } from './schemas/user.schema';
import { UsersController } from './user.controller';
import { UsersService } from './user.service';
import { EmailService } from 'src/mailer/email.service';
import { VerificationService } from './verification.service';
import { ThrottlerModule } from '@nestjs/throttler';

@Module({
  imports: [
    MongooseModule.forFeature([{ name: User.name, schema: UserSchema }]),
    ThrottlerModule.forRoot({
      throttlers: [
        {
          ttl: 60,
          limit: 5,
        },
      ],
    }),
  ],
  controllers: [UsersController],
  providers: [UsersService, EmailService, VerificationService],
  exports: [UsersService],
})
export class UsersModule {}
