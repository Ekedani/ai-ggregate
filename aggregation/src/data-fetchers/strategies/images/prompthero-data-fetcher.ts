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

  /**
   * Fetches AI-generated images from the PromptHero website.
   * @returns An array of AI-generated image documents.
   */
  async fetchData(): Promise<AiGeneratedImage[]> {
    return this.fetchPromptheroData();
  }

  /**
   * Fetches AI-generated image data from the PromptHero website, handling pagination.
   * @returns An array of AI-generated image documents.
   */
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

  /**
   * Retrieves a list of AI-generated image URLs from the PromptHero website, handling pagination.
   * @returns An array of image URLs.
   */
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

  /**
   * Extracts prompt cards from the HTML content.
   * @param html - The HTML content of the gallery page.
   * @returns An array of objects containing prompt URL and creation date.
   */
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

  /**
   * Makes an API call to fetch a gallery page from PromptHero.
   * @param page - The page number to fetch.
   * @returns A promise resolving to the API response.
   */
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

  /**
   * Makes an API call to fetch a prompt page from PromptHero.
   * @param promptUrl - The URL of the prompt page to fetch.
   * @returns A promise resolving to the API response.
   */
  private getPromptPageFromAPI(promptUrl: string) {
    return lastValueFrom(
      this.httpService
        .get(`https://prompthero.com${promptUrl}`)
        .pipe(retry({ count: 5, delay: 10000 })),
    );
  }

  /**
   * Extracts image data from the provided HTML content.
   * @param html - The HTML content of the prompt page.
   * @returns The AI-generated image document.
   */
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

  /**
   * Extracts the generation prompt from the HTML content.
   * @param $ - The Cheerio API instance.
   * @returns The prompt as a string.
   */
  private extractPrompt($: CheerioAPI) {
    return $('div.the-prompt b')
      .contents()
      .map((_, el) => $(el).text().trim())
      .get()
      .join(' ');
  }

  /**
   * Extracts the image author from the HTML content.
   * @param $ - The Cheerio API instance.
   * @returns The author name as a string.
   */
  private extractAuthor($: CheerioAPI) {
    return $('div.d-flex.justify-content-between.mb-4 span')
      .first()
      .text()
      .trim();
  }

  /**
   * Extracts the generative model from the HTML content.
   * @param $ - The Cheerio API instance.
   * @returns The model name as a string.
   */
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

  /**
   * Extracts the creation date from the HTML content.
   * @param $ - The Cheerio API instance.
   * @returns The creation date as a Date object.
   */
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

  /**
   * Extracts the AI-generated image URL from the HTML content.
   * @param $ - The Cheerio API instance.
   * @returns The image URL as a string.
   */
  private extractImageUrl($: CheerioAPI) {
    return $('img.img-fluid').first().attr('src');
  }

  /**
   * Extracts the dimensions of the AI-generated image from the HTML content.
   * @param $ - The Cheerio API instance.
   * @returns An object containing the width and height of the image.
   */
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

  /**
   * Extracts technical generation tags from the HTML content.
   * @param $ - The Cheerio API instance.
   * @returns An array of technical tags as strings.
   */
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

  /**
   * Extracts the original ID of the AI-generated image from the HTML content.
   * @param $ - The Cheerio API instance.
   * @returns The original ID as a string.
   */
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
