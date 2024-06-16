import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { AiGeneratedImage } from '../shared/schemas/ai-generated-image.schema';
import { Model, PipelineStage, Types } from 'mongoose';
import { GetImagesDto } from './dto/get-images.dto';

@Injectable()
export class ImagesService {
  constructor(
    @InjectModel(AiGeneratedImage.name)
    private readonly aiGeneratedImageModel: Model<AiGeneratedImage>,
  ) {}

  /**
   * Retrieves paginated AI-generated images based on the given filter criteria.
   * @param getImagesDto - The filter and pagination details.
   * @returns An object containing total count, current page, and image data.
   */
  public async getPaginatedImages(getImagesDto: GetImagesDto) {
    const { page, limit } = getImagesDto;

    const matchStage = this.buildMatchStage(getImagesDto);
    const results = await this.getMatchedImages(matchStage, page, limit);

    return this.addPaginationData(results, page);
  }

  /**
   * Retrieves a specific AI-generated image by its ID.
   * @param id - The ID of the image to retrieve.
   * @returns The AI-generated image document with the given ID.
   */
  public async getImageById(id: string) {
    return this.aiGeneratedImageModel.findById(id);
  }

  /**
   * Builds a match stage for MongoDB AI-generated images aggregation based on the given filter criteria.
   * @param getImagesDto - The filter criteria.
   * @returns The match stage object for MongoDB aggregation.
   */
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

  /**
   * Retrieves matched AI-generated images from the database based on the match stage and pagination info.
   * @param matchStage - The match stage object for MongoDB aggregation.
   * @param page - The current page number for pagination.
   * @param limit - The number of items per page for pagination.
   * @returns The aggregation result containing metadata and image data.
   */
  private getMatchedImages(matchStage: any, page: number, limit: number) {
    const pipeline: PipelineStage[] = [
      { $match: matchStage },
      {
        $facet: {
          metadata: [{ $count: 'total' }],
          data: [{ $skip: (page - 1) * limit }, { $limit: limit }],
        },
      },
    ];
    return this.aiGeneratedImageModel.aggregate(pipeline);
  }

  /**
   * Adds pagination data to the AI-generated images result set.
   * @param result - The aggregation result containing metadata and image data.
   * @param page - The current page number for pagination.
   * @returns An object containing total count, current page, and image data.
   */
  private addPaginationData(result: any[], page: number) {
    return {
      total: result[0].metadata[0]?.total || 0,
      page,
      images: result[0].data,
    };
  }
}
