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

  private async fetchImages(provider: string): Promise<AiGeneratedImage[]> {
    const fetcher = this.imageFetcherFactory.create(provider);
    return await fetcher.fetchData();
  }

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
