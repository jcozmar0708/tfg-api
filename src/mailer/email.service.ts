import { Injectable } from '@nestjs/common';
import * as nodemailer from 'nodemailer';
import { ConfigService } from '@nestjs/config';
import { getConstants } from 'src/common/constants';

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
}
