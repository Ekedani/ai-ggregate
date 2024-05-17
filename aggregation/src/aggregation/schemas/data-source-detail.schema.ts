import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument } from 'mongoose';

export type DataSourceDetailDocument = HydratedDocument<DataSourceDetail>;

@Schema()
export class DataSourceDetail {
  @Prop({ type: String, enum: ['image', 'text'], required: true })
  contentType: string;

  @Prop({ required: true })
  provider: string;

  @Prop({ required: true })
  fetched: number;

  @Prop({ required: true })
  inserted: number;

  @Prop({
    type: String,
    enum: ['running', 'success', 'failed'],
    required: true,
  })
  status: string;
}

export const DataSourceDetailSchema =
  SchemaFactory.createForClass(DataSourceDetail);
