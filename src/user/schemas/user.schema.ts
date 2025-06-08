import { Schema, Prop, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';
import { v4 as uuidv4 } from 'uuid';

@Schema({ timestamps: true })
export class User extends Document {
  @Prop({ type: String, required: true, default: uuidv4 })
  declare _id: string;

  @Prop({ type: String, required: true })
  fullName: string;

  @Prop({ type: String, required: true })
  phone: string;

  @Prop({ type: String, required: true, unique: true })
  email: string;

  @Prop({ type: String, required: true })
  password: string;

  @Prop({ type: Boolean, default: false })
  isEmailVerified: boolean;

  @Prop({ type: String, default: null })
  emailVerificationCode: string | null;

  @Prop({ type: Date, default: null })
  emailVerificationCodeExpiresAt: Date | null;

  @Prop({ type: Number, default: 5 })
  emailVerificationAttempts: number;

  @Prop({ type: String, default: null })
  passwordResetCode: string | null;

  @Prop({ type: Date, default: null })
  passwordResetCodeExpiresAt: Date | null;

  @Prop({ type: Number, default: 5 })
  passwordResetAttempts: number;

  @Prop({ type: Date, default: null })
  lastEmailVerificationRequestAt: Date | null;

  @Prop({ type: Date, default: null })
  lastPasswordResetRequestAt: Date | null;
}

export const UserSchema = SchemaFactory.createForClass(User);

UserSchema.virtual('uuid').get(function () {
  return this._id;
});

UserSchema.set('toJSON', {
  virtuals: true,
  versionKey: false,
  transform: (_, ret) => {
    delete ret._id;
    delete ret.id;
    delete ret.password;
    delete ret.emailVerificationCode;
    delete ret.emailVerificationCodeExpiresAt;
    delete ret.emailVerificationAttempts;
    delete ret.passwordResetCode;
    delete ret.passwordResetCodeExpiresAt;
    delete ret.passwordResetAttempts;
    delete ret.lastEmailVerificationRequestAt;
    delete ret.lastPasswordResetRequestAt;
    return ret;
  },
});

UserSchema.set('toObject', {
  virtuals: true,
  versionKey: false,
  transform: (_, ret) => {
    delete ret._id;
    delete ret.id;
    delete ret.password;
    delete ret.emailVerificationCode;
    delete ret.emailVerificationCodeExpiresAt;
    delete ret.emailVerificationAttempts;
    delete ret.passwordResetCode;
    delete ret.passwordResetCodeExpiresAt;
    delete ret.passwordResetAttempts;
    delete ret.lastEmailVerificationRequestAt;
    delete ret.lastPasswordResetRequestAt;
    return ret;
  },
});
