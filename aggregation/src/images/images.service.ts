import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { AiGeneratedImage } from '../shared/schemas/ai-generated-image.schema';
import { Model, Types } from 'mongoose';
import { GetImagesDto } from './dto/get-images.dto';

@Injectable()
export class ImagesService {
  constructor(
    @InjectModel(AiGeneratedImage.name)
    private readonly aiGeneratedImageModel: Model<AiGeneratedImage>,
  ) {}

  public async getPaginatedImages(getImagesDto: GetImagesDto) {
    const { page, limit } = getImagesDto;

    const matchStage = this.buildMatchStage(getImagesDto);
    const resultsWithExtra = await this.getMatchedImages(
      matchStage,
      page,
      limit,
    );

    const hasExtra = resultsWithExtra.length > limit;
    const results = hasExtra ? resultsWithExtra.slice(0, -1) : resultsWithExtra;

    return this.addPaginationData(results, page, hasExtra);
  }

  public async getImageById(id: string) {
    return this.aiGeneratedImageModel.findById(id);
  }

  private buildMatchStage(getImagesDto: GetImagesDto) {
    const {
      jobId,
      providerName,
      providerIsTrusted,
      prompt,
      negativePrompt,
      model,
      contentTags,
      technicalTags,
    } = getImagesDto;

    const matchStage = {};

    if (jobId) matchStage['aggregationJob'] = new Types.ObjectId(jobId);
    if (providerName)
      matchStage['provider.name'] = { $regex: providerName, $options: 'i' };
    if (providerIsTrusted !== undefined)
      matchStage['provider.isTrusted'] = providerIsTrusted;
    if (prompt) matchStage['prompt'] = { $regex: prompt, $options: 'i' };
    if (negativePrompt)
      matchStage['negativePrompt'] = { $regex: negativePrompt, $options: 'i' };
    if (model) matchStage['model'] = { $regex: model, $options: 'i' };
    if (contentTags) matchStage['contentTags'] = { $in: contentTags };
    if (technicalTags) matchStage['technicalTags'] = { $in: technicalTags };
    if (getImagesDto.status) matchStage['status'] = getImagesDto.status;

    return matchStage;
  }

  private getMatchedImages(matchStage: any, page: number, limit: number) {
    const pipeline = [
      { $match: matchStage },
      { $skip: (page - 1) * limit },
      { $limit: limit + 1 },
    ];
    return this.aiGeneratedImageModel.aggregate(pipeline);
  }

  private addPaginationData(result: any[], page: number, hasExtra: boolean) {
    const hasNextPage = hasExtra;
    const hasPrevPage = page > 1;

    return {
      count: result.length,
      prevPage: hasPrevPage ? page - 1 : null,
      nextPage: hasNextPage ? page + 1 : null,
      images: result,
    };
  }
}
