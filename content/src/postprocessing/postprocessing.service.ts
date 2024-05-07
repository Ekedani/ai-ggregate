import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { HttpService } from '@nestjs/axios';
import { lastValueFrom } from 'rxjs';

@Injectable()
export class PostprocessingService {
  private readonly logger = new Logger(PostprocessingService.name);
  private readonly POSTPROCESSING_SERVICE_URL: string;

  constructor(
    private readonly httpService: HttpService,
    configService: ConfigService,
  ) {
    this.POSTPROCESSING_SERVICE_URL = configService.get<string>(
      'POSTPROCESSING_SERVICE_URL',
    );
  }

  public enqueueImageForPostprocessing(imageId: string) {
    this.logger.log(`Queueing image #${imageId} for postprocessing`);
    this.processImage(imageId).then(
      () => this.logger.log(`Image #${imageId} processed successfully`),
      (error) =>
        this.logger.error(`Error processing image #${imageId}: ${error}`),
    );
  }

  private async processImage(imageId: string) {
    const url = `${this.POSTPROCESSING_SERVICE_URL}/images`;
    const response = await lastValueFrom(
      this.httpService.post(url, {
        imageId,
      }),
    );
    return response.data;
  }
}
