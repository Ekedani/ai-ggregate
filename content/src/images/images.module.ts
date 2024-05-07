import { Module } from '@nestjs/common';
import { ImagesService } from './images.service';
import { ImagesController } from './images.controller';
import { StorageModule } from '../storage/storage.module';
import { AggregatedImagesController } from './aggregated/aggregated-images.controller';
import { AggregatedImagesService } from './aggregated/aggregated-images.service';
import { MongooseModule } from '@nestjs/mongoose';
import {
  AiGeneratedImage,
  AiGeneratedImageSchema,
} from './schemas/ai-generated-image.schema';
import { HttpModule } from '@nestjs/axios';
import { PostprocessingModule } from '../postprocessing/postprocessing.module';
import { ClassifiersModule } from '../classifiers/classifiers.module';

@Module({
  controllers: [ImagesController, AggregatedImagesController],
  providers: [ImagesService, AggregatedImagesService],
  imports: [
    StorageModule,
    MongooseModule.forFeature([
      { name: AiGeneratedImage.name, schema: AiGeneratedImageSchema },
    ]),
    HttpModule,
    PostprocessingModule,
    ClassifiersModule,
  ],
})
export class ImagesModule {}
