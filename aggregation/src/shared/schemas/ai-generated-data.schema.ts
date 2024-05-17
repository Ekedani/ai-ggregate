import * as mongoose from 'mongoose';
import { Prop } from '@nestjs/mongoose';
import { Provider } from './provider.schema';
import { AggregationJob } from '../../aggregation/schemas/aggregation-job.schema';

export abstract class AiGeneratedData {
  @Prop({ type: Provider, required: true })
  provider: Provider;

  @Prop({ type: mongoose.Schema.Types.ObjectId, ref: 'AggregationJob' })
  aggregationJob?: AggregationJob;

  @Prop()
  originalId?: string;

  @Prop()
  prompt?: string;

  @Prop()
  negativePrompt?: string;

  @Prop()
  model?: string;

  @Prop()
  author?: string;

  @Prop({ type: Date })
  createdAt?: Date;

  @Prop()
  publicationUrl?: string;

  @Prop({
    type: String,
    enum: ['pending', 'approved', 'rejected'],
    default: 'pending',
  })
  status?: string;

  @Prop({ type: Date })
  reviewedAt?: Date;
}
