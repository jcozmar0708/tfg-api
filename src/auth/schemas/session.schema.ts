import { Schema, Prop, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';
import { v4 as uuidv4 } from 'uuid';

@Schema({ timestamps: true })
export class Session extends Document {
  @Prop({ type: String, required: true, unique: true, default: uuidv4 })
  sessionId: string;

  @Prop({ type: String, ref: 'User', required: true })
  userId: string;

  @Prop({ type: Boolean, default: false })
  revoked: boolean;

  @Prop({ type: Date, default: null })
  expiresAt: Date | null;
}

export const SessionSchema = SchemaFactory.createForClass(Session);

SessionSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 });

SessionSchema.virtual('uuid').get(function () {
  return this.sessionId;
});

SessionSchema.set('toJSON', {
  virtuals: true,
  versionKey: false,
  transform: (_, ret) => {
    delete ret._id;
    delete ret.id;
    return ret;
  },
});

SessionSchema.set('toObject', {
  virtuals: true,
  versionKey: false,
  transform: (_, ret) => {
    delete ret._id;
    delete ret.id;
    return ret;
  },
});
