import { Injectable, Logger, NotFoundException } from '@nestjs/common';
import { CreateImageDto } from './dto/create-image.dto';
import { StorageService } from '../storage/storage.service';
import { GetImagesDto } from './dto/get-images.dto';
import { InjectModel } from '@nestjs/mongoose';
import { AiGeneratedImage } from './schemas/ai-generated-image.schema';
import { Model } from 'mongoose';
import * as sharp from 'sharp';
import { PostprocessingService } from '../postprocessing/postprocessing.service';
import { ClassifiersService } from '../classifiers/classifiers.service';

@Injectable()
export class ImagesService {
  private readonly logger = new Logger(ImagesService.name);

  constructor(
    @InjectModel(AiGeneratedImage.name)
    private readonly aiGeneratedImageModel: Model<AiGeneratedImage>,
    private readonly storageService: StorageService,
    private readonly postprocessingService: PostprocessingService,
    private readonly classifierService: ClassifiersService,
  ) {}

  async saveImage(
    createImageDto: CreateImageDto,
    image: Express.Multer.File,
    author: any,
  ) {
    const newImage = await this.createImage(createImageDto, image, author);
    let savedImage = await newImage.save();

    const storageKey = `${savedImage._id}.${savedImage.format}`;
    await this.storageService.uploadObject(
      'genai-images',
      storageKey,
      image.buffer,
    );

    //TODO: add image classifier call here

    savedImage.storageKey = storageKey;
    savedImage = await savedImage.save();
    this.postprocessingService.enqueueImageForPostprocessing(
      savedImage._id.toString(),
    );
    return savedImage;
  }

  async findImages(getImagesDto: GetImagesDto) {
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

  async findImageById(id: string) {
    const image = await this.aiGeneratedImageModel.findById(id);
    if (!image) {
      throw new NotFoundException(`Image with id ${id} not found`);
    }
    return image;
  }

  async deleteImage(id: string) {
    const image = await this.findImageById(id);
    await this.storageService.deleteObject('genai-images', image.storageKey);
    await this.aiGeneratedImageModel.deleteOne({ _id: id });
  }

  private buildMatchStage(getImagesDto: GetImagesDto) {
    const {
      prompt,
      negativePrompt,
      model,
      createdBefore,
      createdAfter,
      provider,
      contentTags,
      technicalTags,
      format,
    } = getImagesDto;

    const matchStage = {};

    if (prompt) matchStage['prompt'] = { $regex: prompt, $options: 'i' };
    if (negativePrompt)
      matchStage['negativePrompt'] = { $regex: negativePrompt, $options: 'i' };
    if (model) matchStage['model'] = { $regex: model, $options: 'i' };

    if (createdBefore || createdAfter) {
      matchStage['createdAt'] = {};
      if (createdBefore) matchStage['createdAt']['$lt'] = createdBefore;
      if (createdAfter) matchStage['createdAt']['$gt'] = createdAfter;
    }

    if (provider) matchStage['provider'] = provider;
    if (format) matchStage['format'] = format;
    if (contentTags) matchStage['contentTags'] = { $in: contentTags };
    if (technicalTags) matchStage['technicalTags'] = { $in: technicalTags };

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

  private addPaginationData(result: any, page: number, hasExtra: boolean) {
    const hasNextPage = hasExtra;
    const hasPrevPage = page > 1;

    return {
      count: result.length,
      prevPage: hasPrevPage ? page - 1 : null,
      nextPage: hasNextPage ? page + 1 : null,
      images: result,
    };
  }

  private async createImage(
    createImageDto: CreateImageDto,
    image: Express.Multer.File,
    author: any,
  ) {
    const size = image.size;
    const { width, height, format } = await sharp(image.buffer).metadata();
    return new this.aiGeneratedImageModel({
      ...createImageDto,
      author: {
        id: author.id,
        name: author.username,
      },
      dimensions: { width, height },
      size,
      format,
    });
  }
}
