import { Body, Controller, Post } from '@nestjs/common';
import { AggregatedImagesService } from './aggregated-images.service';
import { ProcessAggregatedImagesDto } from '../dto/process-aggregated-images.dto';

@Controller('aggregated-images')
export class AggregatedImagesController {
  constructor(private aggregatedService: AggregatedImagesService) {}

  @Post()
  async processAggregatedImages(
    @Body() processAggregatedImagesDto: ProcessAggregatedImagesDto,
  ) {
    return this.aggregatedService.processAggregatedImages(
      processAggregatedImagesDto.aggregatedImages,
    );
  }
}
