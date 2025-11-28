import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';

export type HealthScoreSnapshotDocument = HealthScoreSnapshot & Document;

@Schema({ timestamps: true })
export class HealthScoreSnapshot {
  @Prop({ type: Types.ObjectId, ref: 'User', required: true })
  userId: Types.ObjectId;

  @Prop({ required: true })
  score: number;

  @Prop({ required: true, enum: ['Unstable', 'Improving', 'Stable'] })
  label: 'Unstable' | 'Improving' | 'Stable';

  @Prop({ required: true })
  calculatedAt: Date;

  @Prop()
  context: string;
}

export const HealthScoreSnapshotSchema =
  SchemaFactory.createForClass(HealthScoreSnapshot);

