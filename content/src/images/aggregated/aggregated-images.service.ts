import { Injectable } from '@nestjs/common';
import { Model } from 'mongoose';
import { AiGeneratedImage } from '../schemas/ai-generated-image.schema';
import { AggregatedImageDto } from '../dto/process-aggregated-images.dto';
import { HttpService } from '@nestjs/axios';
import { lastValueFrom, retry } from 'rxjs';
import { InjectModel } from '@nestjs/mongoose';
import * as sharp from 'sharp';
import { StorageService } from '../../storage/storage.service';
import { PostprocessingService } from '../../postprocessing/postprocessing.service';

@Injectable()
export class AggregatedImagesService {
  constructor(
    @InjectModel(AiGeneratedImage.name)
    private readonly aiGeneratedImageModel: Model<AiGeneratedImage>,
    private readonly storageService: StorageService,
    private readonly httpService: HttpService,
    private readonly postprocessingService: PostprocessingService,
  ) {}

  /**
   * Processes a list of aggregated AI-generated images by downloading, saving, and postprocessing them.
   * @param aggregatedImagesDto - Array of DTOs containing aggregated image information.
   * @returns An object containing arrays of success and failure IDs.
   */
  public async processAggregatedImages(
    aggregatedImagesDto: AggregatedImageDto[],
  ) {
    const downloadTasks = aggregatedImagesDto.map(
      async (aggregatedImageDto) => {
        const stagingId = aggregatedImageDto.stagingId;
        try {
          const image = await this.downloadImage(
            aggregatedImageDto.originalImageUrl,
          );
          const metadata = await this.getImageMetadata(image);
          const savedImage = await this.saveImage(
            aggregatedImageDto,
            metadata,
            Buffer.from(image),
          );
          return { status: 'fulfilled', stagingId, savedImage };
        } catch (error) {
          error.stagingId = stagingId;
          throw error;
        }
      },
    );

    const results = await Promise.allSettled(downloadTasks);
    return this.processTasksResults(results);
  }

  /**
   * Downloads an AI-generated image from the specified URL.
   * @param url - The URL of the image to download.
   * @returns The downloaded image as an ArrayBuffer.
   */
  private async downloadImage(url: string): Promise<ArrayBuffer> {
    const fetchImageUsingDefaultClient = async (
      url: string,
    ): Promise<ArrayBuffer> => {
      const response = await lastValueFrom(
        this.httpService
          .get<ArrayBuffer>(url, { responseType: 'arraybuffer' })
          .pipe(retry({ count: 3, delay: 1000 })),
      );
      return response.data;
    };

    try {
      return await fetchImageUsingDefaultClient(url);
    } catch (error) {
      const image = await this.tryDownloadImageInStealthMode(url);
      return await image.arrayBuffer();
    }
  }

  /**
   * Downloads an AI-generated image from the specified URL in the stealth mode.
   * @param url - The URL of the image to download.
   * @param retries - The number of retries to attempt.
   * @returns The downloaded image as an ArrayBuffer.
   */
  private async tryDownloadImageInStealthMode(url: string, retries = 3) {
    try {
      const response = await this.downloadImageInStealthMode(url);
      if (!response.type.startsWith('image')) {
        throw new Error('Invalid response type');
      }
      return response;
    } catch (error) {
      if (retries <= 0) {
        throw error;
      }
      return this.tryDownloadImageInStealthMode(url, retries - 1);
    }
  }

  /**
   * Downloads an AI-generated image in stealth mode with specific headers.
   * @param url - The URL of the image to download.
   * @returns The downloaded image as a Blob.
   */
  private async downloadImageInStealthMode(url: string) {
    const headers = {
      'sec-ch-ua':
        '"Google Chrome";v="123", "Not:A-Brand";v="8", "Chromium";v="123"',
      'sec-ch-ua-mobile': '?0',
      'sec-ch-ua-platform': '"Windows"',
    };
    const response = await fetch(url, {
      headers,
      referrerPolicy: 'strict-origin-when-cross-origin',
    });
    return response.blob();
  }

  /**
   * Retrieves metadata of an AI-generated image using sharp.
   * @param image - The image as an ArrayBuffer.
   * @returns The metadata of the image.
   */
  private async getImageMetadata(image: ArrayBuffer) {
    const metadata = await sharp(image).metadata();
    return {
      dimensions: {
        width: metadata.width,
        height: metadata.height,
      },
      format: metadata.format,
      size: metadata.size,
    };
  }

  /**
   * Saves an AI-generated image and its metadata to the database and storage.
   * @param aggregatedImageDto - DTO containing aggregated image information.
   * @param metadata - Metadata of the image.
   * @param image - The image as a Buffer.
   * @returns The saved image document.
   */
  private async saveImage(
    aggregatedImageDto: AggregatedImageDto,
    metadata: any,
    image: Buffer,
  ) {
    const author = aggregatedImageDto.author
      ? { name: aggregatedImageDto.author }
      : null;
    delete aggregatedImageDto.author;
    const imageData = new this.aiGeneratedImageModel({
      ...aggregatedImageDto,
      ...metadata,
      ...(author && { author }),
    });
    const savedImageData = await imageData.save();
    const storageKey = `${savedImageData._id}.${savedImageData.format}`;
    await this.storageService.uploadObject('genai-images', storageKey, image);
    savedImageData.storageKey = storageKey;
    const savedImage = await imageData.save();
    this.postprocessingService.enqueueImageForPostprocessing(
      savedImage._id.toString(),
    );
    return savedImage;
  }

  /**
   * Processes the results of download tasks.
   * @param results - Array of results from download tasks.
   * @returns An object containing arrays of success and failure IDs.
   */
  private processTasksResults(results: PromiseSettledResult<any>[]) {
    const successIds: string[] = [];
    const failureIds: string[] = [];

    results.forEach((result) => {
      if (result.status === 'fulfilled') {
        successIds.push(result.value.stagingId);
      } else if (result.status === 'rejected') {
        failureIds.push(result.reason.stagingId);
      }
    });

    return { success: successIds, failure: failureIds };
  }
}
