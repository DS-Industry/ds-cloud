import mongoose, {Document, model} from 'mongoose';
import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { CostType } from '@/common/enums';
import { Service } from '../../services/schema/service.schema';

export type PriceDocument = Price & Document;

@Schema({ collection: 'price' })
export class Price {
  @Prop({ required: true })
  cost: number;

  @Prop({ type: String, enum: CostType })
  costType: CostType;

  @Prop({ type: mongoose.Schema.Types.ObjectId, ref: 'service' })
  service: Service;

  @Prop({ type: [String] })
  serviceInfo: string[];

  @Prop({ type: Number })
  serviceDuration: number;

  @Prop({ required: true })
  collectionId: string;

  @Prop({ type: Date, default: Date.now() })
  lastUpdateDate: Date;
}
export const PriceSchema = SchemaFactory.createForClass(Price);

export const PriceModel = model('price', PriceSchema)