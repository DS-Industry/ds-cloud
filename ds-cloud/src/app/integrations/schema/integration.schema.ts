import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

export type IntegrationDocument = Integration & Document;

@Schema({ collection: 'integration' })
export class Integration {
  @Prop({ required: true })
  name: string;

  @Prop({ required: true })
  id: number;

  @Prop({ required: true, default: true })
  isActive: boolean;
}

export const IntegrationSchema = SchemaFactory.createForClass(Integration);
