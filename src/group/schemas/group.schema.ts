import { Schema, Prop, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';
import { v4 as uuidv4 } from 'uuid';

@Schema()
export class Group extends Document {
  @Prop({ required: true, default: uuidv4 })
  declare _id: string;

  @Prop({ required: true })
  name: string;

  @Prop({ type: [Types.ObjectId], ref: 'User', default: [] })
  users: Types.ObjectId[];
}

export const GroupSchema = SchemaFactory.createForClass(Group);

GroupSchema.virtual('uuid').get(function () {
  return this._id;
});

GroupSchema.set('toJSON', { virtuals: true });
GroupSchema.set('toObject', { virtuals: true });
