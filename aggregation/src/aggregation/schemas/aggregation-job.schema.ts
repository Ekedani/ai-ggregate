import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, HydratedDocument } from 'mongoose';
import {
  DataSourceDetail,
  DataSourceDetailSchema,
} from './data-source-detail.schema';

export type AggregationJobDocument = HydratedDocument<AggregationJob>;

@Schema()
export class AggregationJob extends Document {
  @Prop({ required: true, enum: ['scheduled', 'manual'] })
  type: string;

  @Prop({ required: true, enum: ['running', 'finished'] })
  status: string;

  @Prop({ required: true })
  startedAt: Date;

  @Prop()
  finishedAt: Date;

  @Prop({
    type: [DataSourceDetailSchema],
  })
  dataSourceDetails: DataSourceDetail[];
}

export const AggregationJobSchema =
  SchemaFactory.createForClass(AggregationJob);
