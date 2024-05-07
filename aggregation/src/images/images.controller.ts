import {
  Body,
  Controller,
  Get,
  Param,
  Put,
  Query,
  UseGuards,
} from '@nestjs/common';
import { ImagesService } from './images.service';
import { GetImagesDto } from './dto/get-images.dto';
import { BulkImageModerationDto } from './dto/bulk-image-moderation.dto';
import { ModerationService } from './moderation.service';
import { JwtAuthGuard } from '../shared/guards/jwt-auth.guard';

@UseGuards(JwtAuthGuard)
@Controller('images')
export class ImagesController {
  constructor(
    private readonly imagesService: ImagesService,
    private readonly moderationService: ModerationService,
  ) {}

  @Get()
  public async getImages(@Query() getImagesDto: GetImagesDto) {
    return this.imagesService.getPaginatedImages(getImagesDto);
  }

  @Get(':id')
  public async getImageById(@Param('id') id: string) {
    return this.imagesService.getImageById(id);
  }

  @Put('approval')
  public async approveImages(
    @Body() bulkImageModerationDto: BulkImageModerationDto,
  ) {
    const { imageIds } = bulkImageModerationDto;
    return this.moderationService.approveImages(imageIds);
  }

  @Put('rejection')
  public async rejectImages(
    @Body() bulkImageModerationDto: BulkImageModerationDto,
  ) {
    const { imageIds } = bulkImageModerationDto;
    return this.moderationService.rejectImages(imageIds);
  }
}
