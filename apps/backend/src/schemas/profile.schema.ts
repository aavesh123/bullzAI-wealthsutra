import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';

export type ProfileDocument = Profile & Document;

@Schema({ timestamps: true })
export class Profile {
  @Prop({ type: Types.ObjectId, ref: 'User', required: true })
  userId: Types.ObjectId;

  @Prop()
  city: string;

  @Prop()
  incomeMinPerDay: number;

  @Prop()
  incomeMaxPerDay: number;

  @Prop()
  workDaysPerWeek: number;

  @Prop({
    type: {
      rentAmount: { type: Number, default: 0 },
      emiAmount: { type: Number, default: 0 },
      schoolFeesAmount: { type: Number, default: 0 },
    },
    default: {},
  })
  fixedExpenses: {
    rentAmount: number;
    emiAmount: number;
    schoolFeesAmount: number;
  };
}

export const ProfileSchema = SchemaFactory.createForClass(Profile);

