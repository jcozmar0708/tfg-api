import { Injectable, UnauthorizedException } from '@nestjs/common';
import { UsersService } from '../user/user.service';
import * as bcrypt from 'bcrypt';
import { JwtService } from '@nestjs/jwt';
import { JwtPayloadDto } from './dto/jwt-payload.dto';

@Injectable()
export class AuthService {
  constructor(
    private readonly usersService: UsersService,
    private readonly jwtService: JwtService,
  ) {}

  async validateUser(email: string, password: string): Promise<any> {
    const user = await this.usersService.findByEmail(email);

    if (!user?.isEmailVerified) {
      throw new UnauthorizedException('No autorizado');
    }

    const isMatch = await bcrypt.compare(password, user.password);

    if (isMatch) {
      const { password, ...result } = user.toObject();
      return result;
    }

    throw new UnauthorizedException('No autorizado');
  }

  async login(user: any) {
    const payload: JwtPayloadDto = { email: user.email, sub: user._id };

    return {
      accessToken: this.jwtService.sign(payload),
      email: user.email,
    };
  }
}
