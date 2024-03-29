import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import mongoose, {Document, model} from 'mongoose';

export type TagsDocument = Tag & Document;

@Schema({ collection: 'tag' })
export class Tag {
  @Prop({ required: true })
  name: string;

  @Prop({ required: true })
  color: string;
}

export const TagSchema = SchemaFactory.createForClass(Tag);

export const TagModel = model('Tag', TagSchema)