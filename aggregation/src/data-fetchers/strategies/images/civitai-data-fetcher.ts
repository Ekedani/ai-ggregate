import { ImageFetcher } from '../image-fetcher.interface';
import { AiGeneratedImage } from '../../../shared/schemas/ai-generated-image.schema';
import { HttpService } from '@nestjs/axios';
import { lastValueFrom, retry } from 'rxjs';
import { AxiosResponse } from 'axios';

export class CivitaiDataFetcher implements ImageFetcher {
  provider = {
    name: 'Civitai',
    isTrusted: false,
  };

  constructor(private httpService: HttpService) {}

  async fetchData(): Promise<AiGeneratedImage[]> {
    return this.fetchCivitaiData();
  }

  private async fetchCivitaiData(): Promise<AiGeneratedImage[]> {
    const imageData: AiGeneratedImage[] = [];
    let cursor: number | undefined = undefined;
    let fetchMore = true;

    while (fetchMore) {
      const response = await this.getImagesFromAPI(cursor);
      const data = response.data.items;
      const metadata = response.data.metadata;

      for (const item of data) {
        if (new Date(item.createdAt).getTime() < Date.now() - 86400000) {
          fetchMore = false;
          break;
        }
        imageData.push(this.mapToImageData(item));
      }

      if (fetchMore) {
        cursor = metadata.nextCursor;
      }
    }

    return imageData;
  }

  private async getImagesFromAPI(
    cursor?: number,
  ): Promise<
    AxiosResponse<{ items: any[]; metadata: { nextCursor: number } }>
  > {
    return lastValueFrom(
      this.httpService
        .get('https://civitai.com/api/v1/images', {
          params: {
            sort: 'Newest',
            limit: 200,
            nsfw: 'None',
            cursor: cursor,
          },
        })
        .pipe(retry({ count: 5, delay: 10000 })),
    );
  }

  private mapToImageData(item: any): AiGeneratedImage {
    return {
      provider: this.provider,
      originalId: item.id.toString(),
      imageUrl: item.url,
      dimensions: {
        width: item.width,
        height: item.height,
      },
      createdAt: new Date(item.createdAt),
      author: item.username,
      prompt: item.meta?.prompt,
      negativePrompt: item.meta?.negativePrompt,
      model: item.meta?.Model,
      format: item.url.split('.').pop(),
      contentTags: this.extractContentTags(item),
      technicalTags: this.extractTechnicalTags(item.meta),
      publicationUrl: `https://civitai.com/images/${item.id}`,
    };
  }

  private extractContentTags(item: any): string[] {
    const tags = [];
    if (item.nsfw) {
      tags.push('nsfw');
    }
    return tags;
  }

  private extractTechnicalTags(meta: any): string[] {
    const tags = [];
    if (meta === null) return tags;

    tags.push(
      `seed: ${meta.seed}`,
      `steps: ${meta.steps}`,
      `sampler: ${meta.sampler}`,
      `cfg scale: ${meta.cfgScale}`,
    );
    if (meta['Hires upscale'] && meta['Hires upscaler']) {
      tags.push(
        `upscale: ${meta['Hires upscale']} using ${meta['Hires upscaler']}`,
      );
    }
    return tags;
  }
}
