import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';

export type RiskEventDocument = RiskEvent & Document;

@Schema({ timestamps: true })
export class RiskEvent {
  @Prop({ type: Types.ObjectId, ref: 'User', required: true })
  userId: Types.ObjectId;

  @Prop({ required: true, enum: ['low', 'medium', 'high'] })
  riskLevel: 'low' | 'medium' | 'high';

  @Prop({ required: true })
  shortfallAmount: number;

  @Prop({ required: true })
  timeframe: string;
}

export const RiskEventSchema = SchemaFactory.createForClass(RiskEvent);

