import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import mongoose, {Document, model} from 'mongoose';

export type BrandDocument = Brand & Document;

@Schema({ collection: 'brand' })
export class Brand {
  @Prop({ required: true })
  type: string;
  @Prop({ required: true })
  name: string;
}

export const BrandSchema = SchemaFactory.createForClass(Brand);

export const BrandModel = model('Brand', BrandSchema)