import { Document } from 'mongoose';
import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';

export type ServiceDocument = Service & Document;

@Schema({ collection: 'service' })
export class Service {
  @Prop({ required: true })
  id: number;

  @Prop({ required: true })
  name: string;

  @Prop({ required: true })
  description: string;
}
export const ServiceSchema = SchemaFactory.createForClass(Service);
