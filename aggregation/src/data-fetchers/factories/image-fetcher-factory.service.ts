import { LexicaDataFetcher } from '../strategies/images/lexica-data-fetcher';
import { MidjourneyDataFetcher } from '../strategies/images/midjourney-data-fetcher';
import { Injectable } from '@nestjs/common';
import { CivitaiDataFetcher } from '../strategies/images/civitai-data-fetcher';
import { PromptheroDataFetcher } from '../strategies/images/prompthero-data-fetcher';
import { ImageFetcher } from '../strategies/image-fetcher.interface';
import { HttpService } from '@nestjs/axios';

@Injectable()
export class ImageFetcherFactoryService {
  constructor(private httpService: HttpService) {}

  public create(type: string): ImageFetcher {
    switch (type) {
      case 'civitai':
        return new CivitaiDataFetcher(this.httpService);
      case 'lexica':
        return new LexicaDataFetcher();
      case 'midjourney':
        return new MidjourneyDataFetcher();
      case 'prompthero':
        return new PromptheroDataFetcher(this.httpService);
      default:
        throw new Error(`Unknown image fetcher type: ${type}`);
    }
  }

  public getSupportedProviders(): string[] {
    return ['civitai', 'lexica', 'midjourney', 'prompthero'];
  }
}
