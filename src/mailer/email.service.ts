import { Injectable } from '@nestjs/common';
import * as nodemailer from 'nodemailer';
import { ConfigService } from '@nestjs/config';
import { getConstants } from 'src/common/constants';
import * as jwt from 'jsonwebtoken';

@Injectable()
export class EmailService {
  private readonly transporter: nodemailer.Transporter;
  private readonly constants: ReturnType<typeof getConstants>;

  constructor(private readonly configService: ConfigService) {
    this.constants = getConstants(this.configService);

    this.transporter = nodemailer.createTransport({
      host: this.constants.MAIL_HOST,
      port: this.constants.MAIL_PORT,
      secure: false,
      auth: {
        user: this.constants.MAIL_USER,
        pass: this.constants.MAIL_PASSWORD,
      },
    });
  }

  async sendVerificationEmail(to: string, code: string) {
    const from = this.constants.MAIL_USER;

    await this.transporter.sendMail({
      from,
      to,
      subject: 'Verificación de correo',
      html: `
        <h2>Verificación de correo</h2>
        <p>Tu código de verificación es:</p>
        <h1>${code}</h1>
        <br>
        <h3>Este código expirará en 5 minutos.</h3>
      `,
    });
  }

  async sendPasswordResetEmail(to: string, code: string) {
    const from = this.constants.MAIL_USER;

    await this.transporter.sendMail({
      from,
      to,
      subject: 'Código para restablecer contraseña',
      html: `
      <h2>Restablecimiento de contraseña</h2>
      <p>Tu código para restablecer tu contraseña es:</p>
      <h1>${code}</h1>
      <br>
      <h3>Este código expirará en 5 minutos.</h3>
    `,
    });
  }

  async sendGroupInvitationEmail(
    to: string,
    groupName: string,
    inviteCode: string,
    invitedBy: string,
  ) {
    const from = this.constants.MAIL_USER;

    const token = jwt.sign(
      { inviteCode, to, type: 'invite' },
      this.constants.JWT_SECRET_KEY,
      {
        expiresIn: '2d',
      },
    );

    const link = `${this.constants.FRONT_URL}/login?inviteToken=${token}`;

    await this.transporter.sendMail({
      from,
      to,
      subject: `Te han invitado al grupo "${groupName}"`,
      html: `
      <h2>Has sido invitado al grupo "${groupName}"</h2>
      <p><strong>${invitedBy}</strong> te ha invitado a unirte a este grupo.</p>
      <p>Para unirte, haz clic en el siguiente enlace:</p>
      <a href="${link}" target="_blank" style="font-size:18px; color: blue;">${link}</a>
      <br/><br/>
      <small>Si no tienes cuenta, regístrate primero. Serás añadido automáticamente al iniciar sesión.</small>
    `,
    });
  }
}
