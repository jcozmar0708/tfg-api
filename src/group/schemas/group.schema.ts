import { Schema, Prop, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';
import { v4 as uuidv4 } from 'uuid';

@Schema()
export class Group extends Document {
  @Prop({ type: String, required: true, default: uuidv4 })
  declare _id: string;

  @Prop({ type: String, required: true, default: null })
  name: string;

  @Prop({ type: String, required: true, default: null })
  creator: string;

  @Prop({ type: [String], default: [] })
  users: string[];

  @Prop({ type: String, required: true, default: null })
  inviteCode: string;
}

export const GroupSchema = SchemaFactory.createForClass(Group);

GroupSchema.virtual('uuid').get(function () {
  return this._id;
});

GroupSchema.set('toJSON', {
  virtuals: true,
  versionKey: false,
  transform: (_, ret) => {
    delete ret._id;
    delete ret.id;
    return ret;
  },
});

GroupSchema.set('toObject', {
  virtuals: true,
  versionKey: false,
  transform: (_, ret) => {
    delete ret._id;
    delete ret.id;
    return ret;
  },
});
