import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import mongoose, {Document, model} from 'mongoose';
import { User } from '@/user/schema/user.schema';
import { Device } from '@/device/schema/device.schema';
import { Integration } from '../../integrations/schema/integration.schema';
import { Price } from '../../price/schema/price.schema';
import { CollectionType } from '@/common/enums';
import { Tag } from '@/app/tags/Schema/tags.schema';

export type CollectionDocument = Collection & Document;

@Schema({ collection: 'collection' })
export class Collection {
  @Prop({ required: true })
  name: string;

  @Prop({ required: true, unique: true })
  identifier: string;

  @Prop({ required: true })
  city: string;

  @Prop({ type: mongoose.Schema.Types.ObjectId, ref: 'user' })
  owner: User;

  @Prop({ type: [mongoose.Schema.Types.ObjectId], ref: 'device' })
  devices: Device[];

  @Prop({ type: String, enum: CollectionType })
  type: CollectionType;

  @Prop({ type: [mongoose.Schema.Types.ObjectId], ref: 'price' })
  prices: Price[];

  @Prop({ type: [mongoose.Schema.Types.ObjectId], ref: 'integration' })
  integrations: Integration[];

  @Prop({ type: [mongoose.Schema.Types.ObjectId], ref: 'tag' })
  tags: Tag[];

  @Prop({ default: 0 })
  stepCost: number;

  @Prop({ default: 0 })
  limitMinCost: number;

  @Prop({ default: 0 })
  limitMaxCost: number;

  @Prop()
  isActive: boolean;

  @Prop()
  address: string;

  @Prop()
  lat: number;

  @Prop()
  lon: number;
}

export const CollectionSchema = SchemaFactory.createForClass(Collection);
export const CollectionModel = model('collection', CollectionSchema)
