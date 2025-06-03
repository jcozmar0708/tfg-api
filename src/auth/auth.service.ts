import { Injectable, UnauthorizedException } from '@nestjs/common';
import { UsersService } from '../user/user.service';
import * as bcrypt from 'bcrypt';
import { JwtService } from '@nestjs/jwt';
import { JwtPayloadDto } from './dto/jwt-payload.dto';
import { LoginDto } from './dto/login.dto';
import { ConfigService } from '@nestjs/config';
import { getConstants } from 'src/common/constants';
import { SessionService } from './session.service';
import * as jwt from 'jsonwebtoken';
import { GroupsService } from 'src/group/group.service';

@Injectable()
export class AuthService {
  private readonly constants: any;

  constructor(
    private readonly usersService: UsersService,
    private readonly groupsService: GroupsService,
    private readonly jwtService: JwtService,
    private readonly sessionService: SessionService,
    private readonly configService: ConfigService,
  ) {
    this.constants = getConstants(configService);
  }

  async validateUser(dto: LoginDto) {
    const user = await this.usersService.findByEmail(dto.email);

    if (!user?.isEmailVerified)
      throw new UnauthorizedException('No autorizado');

    const isMatch = await bcrypt.compare(dto.password, user.password);

    if (isMatch) {
      const { password, ...result } = user.toObject();
      return result;
    }

    throw new UnauthorizedException('No autorizado');
  }

  async login(user: any, inviteToken?: string) {
    const expiration = new Date(
      Date.now() + this.constants.JWT_TOKEN_EXPIRATION_MS,
    );

    const session = await this.sessionService.create(user.uuid, expiration);

    const payload: JwtPayloadDto = {
      email: user.email,
      uuid: user.uuid,
      sessionId: session.sessionId,
    };

    if (inviteToken) {
      try {
        const decoded: any = jwt.verify(
          inviteToken,
          this.constants.JWT_SECRET_KEY,
        );

        if (decoded?.to !== user.email)
          throw new UnauthorizedException(
            'El token no pertenece a este usuario',
          );

        if (decoded.type !== 'invite')
          throw new UnauthorizedException('Tipo de token no válido');

        await this.groupsService.addUserToGroupByInviteCode(
          user.email,
          decoded.inviteCode,
        );
      } catch (err) {
        console.error('Error procesando el inviteToken:', err);
      }
    }

    return {
      accessToken: this.jwtService.sign(payload, {
        secret: this.constants.JWT_SECRET_KEY,
      }),
    };
  }

  async logout(sessionId: string) {
    await this.sessionService.revoke(sessionId);
  }

  async logoutAll(uuid: string): Promise<void> {
    await this.sessionService.revokeAllForUser(uuid);
  }
}
