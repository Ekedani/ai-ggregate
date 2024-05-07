import { Injectable } from '@nestjs/common';
import { HttpService } from '@nestjs/axios';
import { lastValueFrom } from 'rxjs';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class ClassifiersService {
  private readonly AI_IMAGE_CLASSIFIER_SERVICE_URL: string;

  constructor(
    private readonly httpService: HttpService,
    configService: ConfigService,
  ) {
    this.AI_IMAGE_CLASSIFIER_SERVICE_URL = configService.get<string>(
      'AI_IMAGE_CLASSIFIER_SERVICE_URL',
    );
  }

  public async checkIfImageIsAiGenerated(image: Buffer) {
    const url = `${this.AI_IMAGE_CLASSIFIER_SERVICE_URL}/prediction`;
    const response = await lastValueFrom(
      this.httpService.post<{
        label: string;
        confidence: number;
        model: string;
      }>(url, image),
    );
    return response.data;
  }
}
