import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';

export type GoalDocument = Goal & Document;

@Schema({ timestamps: true })
export class Goal {
  @Prop({ type: Types.ObjectId, ref: 'User', required: true })
  userId: Types.ObjectId;

  @Prop({
    required: true,
    enum: ['emi_payment', 'rent', 'emergency_fund', 'festival_savings'],
  })
  type: 'emi_payment' | 'rent' | 'emergency_fund' | 'festival_savings';

  @Prop({ required: true })
  targetAmount: number;

  @Prop({ required: true })
  targetDate: Date;

  @Prop({ default: 'active' })
  status: string;
}

export const GoalSchema = SchemaFactory.createForClass(Goal);

