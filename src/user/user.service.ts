import {
  BadRequestException,
  Injectable,
  NotFoundException,
  OnModuleInit,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { ConfigService } from '@nestjs/config';
import { User } from './schemas/user.schema';
import { Model } from 'mongoose';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { EmailVerificationDto } from './dto/email-verification.dto';
import { Cron, CronExpression } from '@nestjs/schedule';
import { VerificationService } from './verification.service';
import { getConstants } from 'src/common/constants';
import * as bcrypt from 'bcrypt';
import { ForgotPasswordDto } from './dto/forgot-password.dto';
import { ResetPasswordDto } from './dto/reset-password.dto';
import { EmailOnlyDto } from './dto/email-only.dto';

@Injectable()
export class UsersService implements OnModuleInit {
  private readonly constants: any;

  constructor(
    @InjectModel(User.name) private readonly userModel: Model<User>,
    private readonly verificationService: VerificationService,
    private readonly configService: ConfigService,
  ) {
    this.constants = getConstants(configService);
  }

  async onModuleInit() {
    await this.deleteUnverifiedUsers();
  }

  async findAll(): Promise<User[]> {
    return await this.userModel.find().exec();
  }

  async findOne(uuid: string): Promise<User> {
    const user = await this.userModel.findById(uuid).exec();

    if (!user) {
      throw new NotFoundException(`Usuario con uuid ${uuid} no encontrado`);
    }

    return user;
  }

  async findByEmail(email: string): Promise<User | null> {
    return await this.userModel.findOne({ email }).exec();
  }

  async create(dto: CreateUserDto): Promise<{ message: string }> {
    let existingUser = await this.findByEmail(dto.email);

    if (existingUser && !existingUser.isEmailVerified) {
      existingUser.set({
        fullName: dto.fullName,
        phone: dto.phone,
        password: await bcrypt.hash(dto.password, 10),
      });

      await existingUser.save();

      return {
        message: 'Usuario creado. Código de verificación enviado al correo',
      };
    }

    const newUser = new this.userModel(dto);

    try {
      newUser.password = await bcrypt.hash(dto.password, 10);

      await newUser.save();
    } catch (e) {
      if (e.code === 11000) {
        throw new BadRequestException('El email ya está en uso');
      }
      throw e;
    }

    await this.verificationService.sendAndSaveEmailVerificationCode(newUser);

    return {
      message: 'Usuario creado. Código de verificación enviado al correo',
    };
  }

  async resendVerificationCode(
    dto: EmailOnlyDto,
  ): Promise<{ message: string }> {
    const user = await this.userModel.findOne({ email: dto.email });

    if (!user || user.isEmailVerified) {
      return {
        message: 'Se ha enviado un nuevo código de verificación',
      };
    }

    try {
      this.checkTimeBetweenRequests(user.lastEmailVerificationRequestAt);
    } catch (e) {
      throw new BadRequestException(e.response);
    }

    await this.verificationService.sendAndSaveEmailVerificationCode(user);

    return {
      message: 'Se ha enviado un nuevo código de verificación',
    };
  }

  async verifyEmail(dto: EmailVerificationDto): Promise<{ success: boolean }> {
    const user = await this.userModel.findOne({ email: dto.email });

    if (!user || user.isEmailVerified) {
      throw new BadRequestException('Código inválido o expirado');
    }

    try {
      await this.validateEmailVerificationCode(user, dto.code);
    } catch (e) {
      throw new BadRequestException(e.response);
    }

    this.clearEmailVerificationData(user);
    user.set({ isEmailVerified: true });

    await user.save();
    return { success: true };
  }

  async forgotPassword(dto: ForgotPasswordDto): Promise<{ message: string }> {
    const user = await this.userModel.findOne({ email: dto.email });

    if (!user || !user.isEmailVerified) {
      return {
        message:
          'Se ha enviado un código de verificación para recuperar tu contraseña',
      };
    }

    try {
      this.checkTimeBetweenRequests(user.lastPasswordResetRequestAt);
    } catch (e) {
      throw new BadRequestException(e.response);
    }

    await this.verificationService.sendAndSavePasswordResetCode(user);

    user.lastPasswordResetRequestAt = new Date();
    await user.save();

    return {
      message:
        'Se ha enviado un código de verificación para recuperar tu contraseña',
    };
  }

  async resetPassword(dto: ResetPasswordDto): Promise<{ success: boolean }> {
    const user = await this.userModel.findOne({ email: dto.email });

    if (!user || !user.isEmailVerified) {
      throw new BadRequestException('Código inválido o expirado');
    }

    try {
      await this.validatePasswordResetCode(user, dto.code);
    } catch (e) {
      throw new BadRequestException(e.response);
    }

    this.clearPasswordResetData(user);
    user.set({ password: await bcrypt.hash(dto.newPassword, 10) });

    await user.save();

    return { success: true };
  }

  @Cron(CronExpression.EVERY_HOUR)
  async deleteUnverifiedUsers() {
    const expirationDate = new Date(
      Date.now() - this.constants.UNVERIFIED_USER_EXPIRATION_MS,
    );

    await this.userModel.deleteMany({
      isEmailVerified: false,
      createdAt: { $lt: expirationDate },
    });
  }

  async update(uuid: string, updateUserDto: UpdateUserDto): Promise<User> {
    if (updateUserDto.password) {
      updateUserDto.password = await bcrypt.hash(updateUserDto.password, 10);
    }
    
    const updatedUser = await this.userModel.findByIdAndUpdate(
      uuid,
      updateUserDto,
      {
        new: true,
      },
    );

    if (!updatedUser) {
      throw new NotFoundException(`User with uuid ${uuid} not found`);
    }

    return updatedUser;
  }

  private checkTimeBetweenRequests(lastRequestAt: Date | null) {
    const now = Date.now();
    const lastRequest = lastRequestAt?.getTime() ?? 0;
    if (now - lastRequest < this.constants.RESEND_INTERVAL_MS) {
      const wait = Math.ceil(
        (this.constants.RESEND_INTERVAL_MS - (now - lastRequest)) / 1000,
      );
      throw new BadRequestException({
        error: 'WAIT_TIME_REQUIRED',
        waitTimeSeconds: wait,
      });
    }
  }

  private async validateEmailVerificationCode(user: User, code: string) {
    if (user.emailVerificationAttempts === 0) {
      throw new BadRequestException('Se han agotado los intentos');
    }
    try {
      const isValid =
        await this.verificationService.validateEmailVerificationCode(
          code,
          user,
        );
      if (!isValid) throw new Error();
    } catch {
      user.set({
        emailVerificationAttempts: user.emailVerificationAttempts - 1,
      });
      await user.save();
      throw new BadRequestException('Código inválido o expirado');
    }
  }

  private async validatePasswordResetCode(user: User, code: string) {
    if (user.passwordResetAttempts === 0) {
      throw new BadRequestException('Se han agotado los intentos');
    }
    try {
      const isValid = await this.verificationService.validatePasswordResetCode(
        code,
        user,
      );
      if (!isValid) throw new Error();
    } catch {
      user.set({ passwordResetAttempts: user.passwordResetAttempts - 1 });
      await user.save();
      throw new BadRequestException('Código inválido o expirado');
    }
  }

  private clearEmailVerificationData(user: User) {
    user.set({
      emailVerificationCode: null,
      emailVerificationCodeExpiresAt: null,
      emailVerificationAttempts: this.constants.MAX_VERIFICATION_ATTEMPTS,
    });
  }

  private clearPasswordResetData(user: User) {
    user.set({
      passwordResetCode: null,
      passwordResetCodeExpiresAt: null,
      passwordResetAttempts: this.constants.MAX_VERIFICATION_ATTEMPTS,
    });
  }
}
