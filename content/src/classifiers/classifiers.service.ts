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

  public async classifyImage(image: Buffer, format: string) {
    const formData = new FormData();
    formData.append('file', new Blob([image]), `file.${format}`);
    const url = `${this.AI_IMAGE_CLASSIFIER_SERVICE_URL}/prediction`;
    const response = await lastValueFrom(
      this.httpService.post<{
        label: string;
        confidence: number;
        model: string;
      }>(url, formData),
    );
    return response.data;
  }
}
