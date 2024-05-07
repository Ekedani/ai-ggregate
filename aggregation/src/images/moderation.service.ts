import { BadRequestException, Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import {
  AiGeneratedImage,
  AiGeneratedImageDocument,
} from '../shared/schemas/ai-generated-image.schema';
import { Model, Types } from 'mongoose';
import { HttpService } from '@nestjs/axios';
import { ConfigService } from '@nestjs/config';
import { lastValueFrom } from 'rxjs';

@Injectable()
export class ModerationService {
  private readonly CONTENT_SERVICE_URL: string;

  constructor(
    @InjectModel(AiGeneratedImage.name)
    private readonly aiGeneratedImageModel: Model<AiGeneratedImage>,
    private readonly httpService: HttpService,
    configService: ConfigService,
  ) {
    this.CONTENT_SERVICE_URL = `${configService.get<string>('CONTENT_SERVICE_URL')}`;
  }

  async approveImages(imageIds: string[]) {
    const approvedImages = await this.findImagesByIds(imageIds);

    const approvedImagesDto = approvedImages.map((image) =>
      this.mapImageToContentDto(image),
    );
    const contentUploadEndpoint = `${this.CONTENT_SERVICE_URL}/aggregated-images`;
    const response = await lastValueFrom(
      this.httpService.post(contentUploadEndpoint, {
        aggregatedImages: approvedImagesDto,
      }),
    );

    const { success, failure } = response.data;
    const successfullyApprovedImages = approvedImages.filter((image) =>
      success.includes(image._id.toString()),
    );

    const updated = await this.updateImagesStatus(
      successfullyApprovedImages,
      'approved',
    );
    return {
      success: updated,
      failure,
    };
  }

  async rejectImages(imageIds: string[]) {
    const rejectedImages = await this.findImagesByIds(imageIds);
    const rejected = await this.updateImagesStatus(rejectedImages, 'rejected');
    return {
      success: rejected,
      failure: [],
    };
  }

  private async findImagesByIds(imageIds: string[]) {
    const uniqueImageIds = Array.from(new Set(imageIds));
    const objectIds = uniqueImageIds.map((id) => new Types.ObjectId(id));

    const foundImages = await this.aiGeneratedImageModel
      .find({ _id: { $in: objectIds } })
      .exec();

    if (foundImages.length !== imageIds.length) {
      throw new BadRequestException('Some images were not found');
    }
    return foundImages;
  }

  private async updateImagesStatus(
    images: AiGeneratedImageDocument[],
    status: string,
  ) {
    const objectIds = images.map((image) => image._id);
    await this.aiGeneratedImageModel.updateMany(
      { _id: { $in: objectIds } },
      {
        status,
        reviewedAt: new Date(),
      },
    );
    return objectIds;
  }

  private mapImageToContentDto(image: AiGeneratedImageDocument) {
    return {
      stagingId: image._id,
      provider: image.provider?.name,
      originalImageUrl: image.imageUrl,
      originalId: image.originalId,
      prompt: image.prompt,
      negativePrompt: image.negativePrompt,
      model: image.model,
      author: image.author,
      createdAt: image.createdAt,
      publicationUrl: image.publicationUrl,
      format: image.format,
      contentTags: image.contentTags,
      technicalTags: image.technicalTags,
    };
  }
}
