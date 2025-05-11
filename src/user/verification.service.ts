import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as bcrypt from 'bcrypt';
import { EmailService } from '../mailer/email.service';
import { User } from './schemas/user.schema';
import { getConstants } from '../common/constants';

@Injectable()
export class VerificationService {
  private readonly constants: any;

  constructor(
    private readonly emailService: EmailService,
    private readonly configService: ConfigService,
  ) {
    this.constants = getConstants(this.configService);
  }

  generateVerificationCode(): string {
    return Math.floor(100000 + Math.random() * 900000).toString();
  }

  async sendAndSaveVerificationCode(user: User) {
    const code = this.generateVerificationCode();
    const hashed = await bcrypt.hash(code, 10);
    const expiration = new Date(
      Date.now() + this.constants.VERIFICATION_CODE_EXPIRATION_MS,
    );

    user.set({
      emailVerificationCode: hashed,
      emailVerificationCodeExpiresAt: expiration,
      emailVerificationAttempts: this.constants.MAX_VERIFICATION_ATTEMPTS,
      lastVerificationRequestAt: new Date(),
    });

    await user.save();
    await this.emailService.sendVerificationEmail(user.email, code);
  }

  async validateCode(code: string, user: User): Promise<boolean> {
    if (
      user.emailVerificationCodeExpiresAt &&
      user.emailVerificationCodeExpiresAt < new Date()
    ) {
      throw new Error('Código expirado');
    }

    if (!user.emailVerificationCode) {
      throw new Error('Código de verificacion no disponible');
    }

    return await bcrypt.compare(code, user.emailVerificationCode);
  }
}
