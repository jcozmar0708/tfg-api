import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

@Schema({ timestamps: true })
export class Debt extends Document {
  @Prop({ type: String, required: true })
  groupUUID: string;

  @Prop({ type: String, required: true })
  title: string;

  @Prop({ type: String, required: true })
  fromEmail: string;

  @Prop({ type: String, required: true })
  toEmail: string;

  @Prop({ type: Number, required: true })
  amount: number;
}

export const DebtSchema = SchemaFactory.createForClass(Debt);
