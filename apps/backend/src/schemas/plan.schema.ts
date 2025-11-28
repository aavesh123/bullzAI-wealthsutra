import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';

export type PlanDocument = Plan & Document;

@Schema({ timestamps: true })
export class Plan {
  @Prop({ type: Types.ObjectId, ref: 'User', required: true })
  userId: Types.ObjectId;

  @Prop({ type: Types.ObjectId, ref: 'Goal', default: null })
  goalId: Types.ObjectId | null;

  @Prop({ required: true })
  startDate: Date;

  @Prop({ required: true })
  endDate: Date;

  @Prop({ required: true })
  dailySavingTarget: number;

  @Prop({ type: Object, default: {} })
  spendingCaps: Record<string, number>;

  @Prop({ default: 'active' })
  status: string;
}

export const PlanSchema = SchemaFactory.createForClass(Plan);
PlanSchema.index({ userId: 1, status: 1 });

