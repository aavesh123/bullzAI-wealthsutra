import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

export type UserDocument = User & Document & {
  createdAt: Date;
  updatedAt: Date;
};

@Schema({ timestamps: true })
export class User {
  @Prop({ required: true, unique: true })
  phoneNumber: string;

  @Prop({ required: true, enum: ['gig_worker', 'daily_wage'] })
  personaType: 'gig_worker' | 'daily_wage';
}

export const UserSchema = SchemaFactory.createForClass(User);

