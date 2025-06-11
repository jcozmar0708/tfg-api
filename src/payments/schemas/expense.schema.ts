import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

@Schema({ timestamps: true })
export class Expense extends Document {
  @Prop({ type: String, required: true })
  groupUUID: string;

  @Prop({ type: String, required: true })
  payerEmail: string;

  @Prop({ type: String, required: true })
  title: string;

  @Prop({ type: String, required: true })
  amount: number;

  @Prop({ type: [String], required: true })
  participants: string[];
}

export const ExpenseSchema = SchemaFactory.createForClass(Expense);
