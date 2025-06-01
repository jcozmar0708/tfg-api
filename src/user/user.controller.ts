import {
  Body,
  Controller,
  Get,
  Patch,
  Post,
  Req,
  UseGuards,
} from '@nestjs/common';
import { UsersService } from './user.service';
import { CreateUserDto } from './dto/create-user.dto';
import { User } from './schemas/user.schema';
import { UpdateUserDto } from './dto/update-user.dto';
import { EmailVerificationDto } from './dto/email-verification.dto';
import { Throttle } from '@nestjs/throttler';
import { ForgotPasswordDto } from './dto/forgot-password.dto';
import { ResetPasswordDto } from './dto/reset-password.dto';
import { EmailOnlyDto } from './dto/email-only.dto';
import { JwtAuthGuard } from 'src/auth/jwt/jwt-auth.guard';

@Controller('users')
export class UsersController {
  constructor(private readonly userService: UsersService) {}

  @Get()
  async findAll(): Promise<User[]> {
    return await this.userService.findAll();
  }

  @UseGuards(JwtAuthGuard)
  @Get('profile')
  async findOne(@Req() req): Promise<User> {
    return await this.userService.findOne(req.user.uuid);
  }

  @Post('register')
  async register(
    @Body() createUserDto: CreateUserDto,
  ): Promise<{ message: string }> {
    return await this.userService.create(createUserDto);
  }

  @Post('verify-email')
  async verifyEmail(
    @Body() emailVerificationDto: EmailVerificationDto,
  ): Promise<{ success: boolean }> {
    return await this.userService.verifyEmail(emailVerificationDto);
  }

  @Throttle({ default: { limit: 1, ttl: 120 } })
  @Post('resend-verification-code')
  async resendVerificationCode(@Body() body: EmailOnlyDto) {
    return this.userService.resendVerificationCode(body);
  }

  @Throttle({ default: { limit: 1, ttl: 120 } })
  @Post('forgot-password')
  async forgotPassword(
    @Body() dto: ForgotPasswordDto,
  ): Promise<{ message: string }> {
    return await this.userService.forgotPassword(dto);
  }

  @Post('reset-password')
  async resetPassword(
    @Body() dto: ResetPasswordDto,
  ): Promise<{ success: boolean }> {
    return await this.userService.resetPassword(dto);
  }

  @UseGuards(JwtAuthGuard)
  @Patch('update-profile')
  async update(@Req() req, @Body() updateUserDto: UpdateUserDto) {
    return await this.userService.update(req.user.uuid, updateUserDto);
  }
}
