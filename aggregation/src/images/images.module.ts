import { Module } from '@nestjs/common';
import { ImagesService } from './images.service';
import { ImagesController } from './images.controller';
import { MongooseModule } from '@nestjs/mongoose';
import {
  AiGeneratedImage,
  AiGeneratedImageSchema,
} from '../shared/schemas/ai-generated-image.schema';
import { HttpModule } from '@nestjs/axios';
import { ModerationService } from './moderation.service';

@Module({
  providers: [ImagesService, ModerationService],
  controllers: [ImagesController],
  imports: [
    MongooseModule.forFeature([
      { name: AiGeneratedImage.name, schema: AiGeneratedImageSchema },
    ]),
    HttpModule,
  ],
})
export class ImagesModule {}
