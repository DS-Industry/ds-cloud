import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import mongoose, {Document, model} from 'mongoose';
export type TypeDocument = Type & Document;

@Schema({ collection: 'type' })
export class Type {
  @Prop({ required: true })
  type: string;
  @Prop({ required: true })
  name: string;
}

export const TypeSchema = SchemaFactory.createForClass(Type);

export const TypeModel = model('type', TypeSchema)