import { Injectable, Logger } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { AiGeneratedImage } from '../../shared/schemas/ai-generated-image.schema';
import { Model } from 'mongoose';
import { DataSourceDetail } from '../schemas/data-source-detail.schema';
import { ImageFetcherFactoryService } from '../../data-fetchers/factories/image-fetcher-factory.service';
import { AggregationJob } from '../schemas/aggregation-job.schema';

@Injectable()
export class ImageCollectorService {
  private logger = new Logger('ImageCollectorService');

  constructor(
    @InjectModel(AiGeneratedImage.name)
    private readonly aiGeneratedImageModel: Model<AiGeneratedImage>,
    private readonly imageFetcherFactory: ImageFetcherFactoryService,
  ) {}

  /**
   * Collects AI-generated images based on the provided aggregation job.
   * @param aggregationJob - The aggregation job containing data source details.
   * @returns An array of DataSourceDetail objects.
   */
  public async collectAiGeneratedImages(
    aggregationJob: AggregationJob,
  ): Promise<DataSourceDetail[]> {
    const providers =
      aggregationJob.dataSourceDetails.length > 0
        ? aggregationJob.dataSourceDetails.map((detail) => detail.provider)
        : this.imageFetcherFactory.getSupportedProviders();

    const promises = providers.map((provider) =>
      this.collectImagesFromProvider(provider, aggregationJob),
    );
    const results = await Promise.allSettled(promises);
    return this.processResults(results);
  }

  /**
   * Collects images from a specific provider.
   * @param provider - The name of the provider.
   * @param aggregationJob - The aggregation job containing data source details.
   * @returns A DataSourceDetail object with the result of the collection.
   */
  private async collectImagesFromProvider(
    provider: string,
    aggregationJob: AggregationJob,
  ): Promise<DataSourceDetail> {
    try {
      this.logger.log(`Fetching images from ${provider}`);

      const images = await this.fetchImages(provider);
      const inserted = await this.saveImages(images, aggregationJob);

      this.logger.log(
        `Fetched images from ${provider} (${images.length}/${inserted})`,
      );
      return this.createDataSourceDetail(
        provider,
        images.length,
        inserted,
        'success',
      );
    } catch (error) {
      this.logger.error(`Failed to fetch data from ${provider}: ${error}`);
      return this.createDataSourceDetail(provider, 0, 0, 'failed');
    }
  }

  /**
   * Fetches images from a specific provider using the appropriate fetcher.
   * @param provider - The name of the provider.
   * @returns An array of AI-generated image documents.
   */
  private async fetchImages(provider: string): Promise<AiGeneratedImage[]> {
    const fetcher = this.imageFetcherFactory.create(provider);
    return await fetcher.fetchData();
  }

  /**
   * Saves the fetched images to the staging database.
   * @param images - The array of AI-generated images to save.
   * @param aggregationJob - The aggregation job associated with the images.
   * @returns The number of inserted images.
   */
  private async saveImages(
    images: AiGeneratedImage[],
    aggregationJob: AggregationJob,
  ): Promise<number> {
    images.forEach((image) => (image.aggregationJob = aggregationJob));
    const bulkOps = images.map((image) => ({
      insertOne: { document: image },
    }));
    try {
      const result = await this.aiGeneratedImageModel.bulkWrite(bulkOps, {
        ordered: false,
      });
      return result.insertedCount;
    } catch (error) {
      return error.result?.insertedCount ?? 0;
    }
  }

  /**
   * Creates a DataSourceDetail object.
   * @param provider - The name of the provider.
   * @param fetched - The number of fetched images.
   * @param inserted - The number of inserted images.
   * @param status - The status of the collection.
   * @returns A DataSourceDetail object.
   */
  private createDataSourceDetail(
    provider: string,
    fetched: number,
    inserted: number,
    status: string,
  ): DataSourceDetail {
    return {
      contentType: 'image',
      provider,
      fetched,
      inserted,
      status,
    };
  }

  /**
   * Processes the results of the image collection tasks.
   * @param results - An array of PromiseSettledResult objects.
   * @returns An array of DataSourceDetail objects.
   */
  private processResults(
    results: PromiseSettledResult<DataSourceDetail>[],
  ): DataSourceDetail[] {
    return results.map((result) => {
      if (result.status === 'fulfilled') {
        return result.value;
      } else {
        return {
          contentType: 'image',
          provider: 'unknown',
          fetched: 0,
          inserted: 0,
          status: 'failed',
        };
      }
    });
  }
}
