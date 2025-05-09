import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { User } from './schemas/user.schema';
import { Model } from 'mongoose';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { EmailService } from '../mailer/email.service';
import { EmailVerificationDto } from './dto/email-verification.dto';

@Injectable()
export class UsersService {
  constructor(
    @InjectModel(User.name) private readonly userModel: Model<User>,
    private readonly emailService: EmailService,
  ) {}

  async findAll(): Promise<User[]> {
    return await this.userModel.find().exec();
  }

  async findOne(uuid: string): Promise<User> {
    const user = await this.userModel.findById(uuid).exec();

    if (!user) {
      throw new NotFoundException(`User with uuid ${uuid} not found`);
    }

    return user;
  }

  async create(createUserDto: CreateUserDto): Promise<{ message: string }> {
    const existing = await this.userModel.findOne({
      email: createUserDto.email,
    });

    if (existing) {
      throw new BadRequestException('El email ya está en uso');
    }

    const verificationCode = Math.floor(
      100000 + Math.random() * 900000,
    ).toString();

     const codeExpires = new Date(Date.now() + 15 * 60 * 1000);

    const newUser = new this.userModel({
      ...createUserDto,
      isEmailVerified: false,
      emailVerificationCode: verificationCode,
      emailVerificationCodeExpiresAt: codeExpires,
    });

    await newUser.save();

    await this.emailService.sendVerificationEmail(
      newUser.email,
      verificationCode,
    );

    return {
      message: 'Usuario creado. Código de verificación enviado al correo',
    };
  }

  async verifyEmail(
    emailVerificationDto: EmailVerificationDto,
  ): Promise<{ message: string }> {
    const user = await this.userModel.findOne({
      email: emailVerificationDto.email,
    });

    if (!user || user.emailVerificationCode !== emailVerificationDto.code) {
      throw new BadRequestException('El código introducido es incorrecto');
    }

    if (
      user.emailVerificationCodeExpiresAt &&
      user.emailVerificationCodeExpiresAt < new Date()
    ) {
      throw new BadRequestException('El código ha expirado');
    }

    user.isEmailVerified = true;
    user.emailVerificationCode = null;
    user.emailVerificationCodeExpiresAt = null;
    await user.save();

    return { message: 'Correo verificado correctamente' };
  }

  async update(uuid: string, updateUserDto: UpdateUserDto): Promise<User> {
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
}
