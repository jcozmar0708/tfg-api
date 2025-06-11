import {
  Controller,
  Post,
  Body,
  Delete,
  UseGuards,
  Req,
  HttpCode,
} from '@nestjs/common';
import { AuthService } from './auth.service';
import { LoginDto } from './dto/login.dto';
import { JwtAuthGuard } from './jwt/jwt-auth.guard';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('login')
  async login(@Body() loginDto: LoginDto) {
    const user = await this.authService.validateUser(loginDto);
    return this.authService.login(user, loginDto.inviteToken);
  }

  @UseGuards(JwtAuthGuard)
  @Delete('logout')
  @HttpCode(204)
  async logout(@Req() req) {
    await this.authService.logout(req.user.sessionId);
  }
}
