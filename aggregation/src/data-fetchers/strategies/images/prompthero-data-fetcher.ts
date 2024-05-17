import { ImageFetcher } from '../image-fetcher.interface';
import { AiGeneratedImage } from '../../../shared/schemas/ai-generated-image.schema';
import { HttpService } from '@nestjs/axios';
import { lastValueFrom, retry } from 'rxjs';
import { CheerioAPI, load } from 'cheerio';
import { parse } from 'date-fns';

export class PromptheroDataFetcher implements ImageFetcher {
  provider = {
    name: 'PromptHero',
    isTrusted: false,
  };

  constructor(private httpService: HttpService) {}

  async fetchData(): Promise<AiGeneratedImage[]> {
    return this.fetchPromptheroData();
  }

  private async fetchPromptheroData(): Promise<AiGeneratedImage[]> {
    const imageUrls = await this.getImageUrls();
    const imagesData = [];
    for (const url of imageUrls) {
      let html: string;
      try {
        const response = await this.getPromptPageFromAPI(url);
        html = response.data;
        const imageData = this.extractImageData(html);
        imageData.publicationUrl = `https://prompthero.com${url}`;
        imagesData.push(imageData);
      } catch (e) {
        continue;
      }
    }
    return imagesData;
  }

  private async getImageUrls(): Promise<any[]> {
    let page = 1;
    let fetchMore = true;
    const urls = [];
    while (fetchMore) {
      const response = await this.getGalleryPageFromAPI(page);
      const promptCards = this.extractPromptCards(response.data);
      if (promptCards.some((card) => card.createdAt.includes('day'))) {
        fetchMore = false;
      } else {
        page++;
      }
      urls.push(
        ...promptCards
          .filter((card) => !card.createdAt.includes('day'))
          .map((card) => card.promptUrl),
      );
    }
    return urls;
  }

  private extractPromptCards(
    html: string,
  ): { promptUrl: string; createdAt: string }[] {
    const $ = load(html);
    return $('article.prompt-card')
      .map((_, el) => {
        const promptUrl = $(el).find('a.prompt-card-a').attr('href');
        const createdAt = $(el)
          .find('.prompt-card-details p.masonry-hide-unless-hover b')
          .text()
          .trim();

        return {
          promptUrl,
          createdAt,
        };
      })
      .get();
  }

  private getGalleryPageFromAPI(page: number) {
    return lastValueFrom(
      this.httpService
        .get('https://prompthero.com/newest', {
          params: {
            sort: 'newest',
            page: page,
          },
        })
        .pipe(retry({ count: 5, delay: 10000 })),
    );
  }

  private getPromptPageFromAPI(promptUrl: string) {
    return lastValueFrom(
      this.httpService
        .get(`https://prompthero.com${promptUrl}`)
        .pipe(retry({ count: 5, delay: 10000 })),
    );
  }

  private extractImageData(html: string): AiGeneratedImage {
    const $ = load(html);
    const prompt = this.extractPrompt($);
    const model = this.extractModel($);
    const originalId = this.extractOriginalId($);
    const author = this.extractAuthor($);
    const createdAt = this.extractCreationDate($);
    const imageUrl = this.extractImageUrl($);
    const dimensions = this.extractDimensions($);
    const technicalTags = this.extractTechnicalTags($);
    return {
      provider: this.provider,
      prompt,
      model,
      author,
      originalId,
      createdAt,
      imageUrl,
      dimensions,
      format: 'webp',
      technicalTags,
    };
  }

  private extractPrompt($: CheerioAPI) {
    return $('div.the-prompt b')
      .contents()
      .map((_, el) => $(el).text().trim())
      .get()
      .join(' ');
  }

  private extractAuthor($: CheerioAPI) {
    return $('div.d-flex.justify-content-between.mb-4 span')
      .first()
      .text()
      .trim();
  }

  private extractModel($: CheerioAPI) {
    return $('i.fa-solid.fa-robot')
      .parent()
      .contents()
      .map((_, el) => {
        return $(el).text().trim();
      })
      .get()
      .join(' ')
      .trim();
  }

  private extractCreationDate($: CheerioAPI) {
    const dateText = $('span')
      .filter(function () {
        return $(this).text().includes('posted');
      })
      .attr('title')
      .trim()
      .replace(/\s+/g, ' ');
    const format = "MMMM dd, yyyy hh:mma 'UTC'";
    return parse(dateText, format, new Date());
  }

  private extractImageUrl($: CheerioAPI) {
    return $('img.img-fluid').first().attr('src');
  }

  private extractDimensions($: CheerioAPI) {
    const dimensionsText = $('i.fa-regular.fa-image').parent().text().trim();
    const [width, height] = dimensionsText
      .split('x')
      .map((dim) => parseInt(dim, 10));
    return {
      width,
      height,
    };
  }

  private extractTechnicalTags($: CheerioAPI) {
    const metadata = $('div.metadata');
    return metadata
      .find('span[data-toggle="tooltip"]')
      .map(function () {
        const title = $(this).attr('title').split(':')[0] + ':';
        const value = $(this).text().trim();
        return `${title} ${value}`.toLowerCase();
      })
      .get();
  }

  private extractOriginalId($: CheerioAPI) {
    return $('img.img-fluid')
      .first()
      .attr('src')
      .split('/')
      .pop()
      .split('.')[0]
      .split('-')
      .pop();
  }
}
