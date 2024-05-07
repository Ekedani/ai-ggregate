import { Module } from '@nestjs/common';
import { AggregationService } from './aggregation.service';
import { AggregationJobsController } from './aggregation-jobs.controller';
import { DataFetchersModule } from '../data-fetchers/data-fetchers.module';
import { MongooseModule } from '@nestjs/mongoose';
import {
  AggregationJob,
  AggregationJobSchema,
} from './schemas/aggregation-job.schema';
import {
  AiGeneratedImage,
  AiGeneratedImageSchema,
} from '../shared/schemas/ai-generated-image.schema';
import { ImageCollectorService } from './collectors/image-collector.service';

@Module({
  providers: [AggregationService, ImageCollectorService],
  controllers: [AggregationJobsController],
  imports: [
    MongooseModule.forFeature([
      { name: AggregationJob.name, schema: AggregationJobSchema },
      { name: AiGeneratedImage.name, schema: AiGeneratedImageSchema },
    ]),
    DataFetchersModule,
  ],
})
export class AggregationModule {}
