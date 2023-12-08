import {Document, model} from 'mongoose';
import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Exclude } from 'class-transformer';

export type UserDocument = User & Document;

@Schema()
export class User {
  @Prop()
  name: string;

  @Prop()
  email: string;

  @Prop()
  @Exclude()
  password: string;

  @Prop()
  refreshToken: string;

  @Prop()
  apiKey: string;

  @Prop({ type: [String] })
  roles: string[];
}

export const UserSchema = SchemaFactory.createForClass(User);

export const UserModel = model('User', UserSchema)