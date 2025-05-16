import { Injectable, UnauthorizedException } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { ConfigService } from '@nestjs/config';
import { UsersService } from '../../user/user.service';
import { JwtPayloadDto } from '../dto/jwt-payload.dto';
import { SessionService } from '../session.service';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor(
    private readonly configService: ConfigService,
    private readonly usersService: UsersService,
    private readonly sessionService: SessionService,
  ) {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey: configService.get<string>('JWT_SECRET_KEY'),
    });
  }

  async validate(payload: JwtPayloadDto) {
    const session = await this.sessionService.findById(payload.sessionId);
    const user = await this.usersService.findByEmail(payload.email);

    if (
      !user ||
      !session ||
      session.revoked ||
      (session.expiresAt && session.expiresAt < new Date())
    ) {
      throw new UnauthorizedException('No autorizado');
    }

    return {
      uuid: payload.uuid,
      email: payload.email,
      sessionId: payload.sessionId,
    };
  }
}
