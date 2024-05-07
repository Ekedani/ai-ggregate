import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { HttpService } from '@nestjs/axios';
import { lastValueFrom } from 'rxjs';
import { ImagesService } from '../images/images.service';

@Injectable()
export class PostprocessingService {
  private readonly logger = new Logger(ImagesService.name);
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
    this.logger.log(`Queueing image with id ${imageId} for postprocessing`);
    this.processImage(imageId).then(
      () => this.logger.log(`Image ${imageId} processed successfully`),
      (error) =>
        this.logger.error(`Error processing image ${imageId}: ${error}`),
    );
  }

  public async processImage(imageId: string) {
    const url = `${this.POSTPROCESSING_SERVICE_URL}/images`;
    const response = await lastValueFrom(
      this.httpService.post(url, {
        imageId,
      }),
    );
    return response.data;
  }
}
