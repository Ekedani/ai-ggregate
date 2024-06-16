import { ImageFetcher } from '../image-fetcher.interface';
import { AiGeneratedImage } from '../../../shared/schemas/ai-generated-image.schema';
import puppeteer, { Page } from 'puppeteer';
import { CheerioAPI, load } from 'cheerio';

export class LexicaDataFetcher implements ImageFetcher {
  provider = {
    name: 'Lexica',
    isTrusted: false,
  };

  /**
   * Fetches AI-generated images from the Lexica SPA.
   * @returns An array of AI-generated image documents.
   */
  async fetchData(): Promise<AiGeneratedImage[]> {
    const browser = await puppeteer.launch({
      headless: true,
      args: ['--no-sandbox', '--disable-setuid-sandbox'],
    });
    const page = await browser.newPage();
    await page.setViewport({
      width: 1366,
      height: 768,
    });

    const imagesData = await this.scrapeImagesData(page);
    await browser.close();
    return imagesData;
  }

  /**
   * Scrapes image data from the Lexica gallery.
   * @param page - The Puppeteer page instance.
   * @returns An array of AI-generated image documents.
   */
  private async scrapeImagesData(page: Page): Promise<AiGeneratedImage[]> {
    await page.goto('https://lexica.art/');
    const detailPageUrls = await this.monitorAndCaptureUrls(page);

    const imagesData = [];
    for (const url of detailPageUrls) {
      await page.goto(url);
      try {
        await this.waitUntilImageDataLoaded(page);
      } catch (e) {
        continue;
      }
      const detailHtml = await page.content();
      const currentImagesData = this.extractImageData(detailHtml);
      currentImagesData.forEach(
        (imageData) => (imageData.publicationUrl = url),
      );
      imagesData.push(...currentImagesData);
    }

    return imagesData;
  }

  /**
   * Monitors the page for new AI-generated image URLs and captures them.
   * @param page - The Puppeteer page instance.
   * @returns An array of captured image URLs.
   */
  private async monitorAndCaptureUrls(page: Page): Promise<string[]> {
    const urls = new Set<string>();
    await page.exposeFunction('saveUrl', (url: string) => {
      urls.add(url);
    });

    await page.exposeFunction('getSetSize', () => {
      return urls.size;
    });

    const observerHandle = await this.setMutationObserver(page);
    await this.scrollPageUntilSetIsFilled(page, 150);
    await observerHandle.dispose();

    return Array.from(urls);
  }

  /**
   * Sets a mutation observer on the page to capture new AI-generated image URLs.
   * @param page - The Puppeteer page instance.
   * @returns A handle to the mutation observer.
   */
  private async setMutationObserver(page: Page) {
    return page.evaluateHandle(() => {
      const processNode = (node) => {
        if (
          node instanceof HTMLElement &&
          node.matches('div[role="gridcell"]')
        ) {
          const url = node.querySelector('a')?.href;
          if (url) {
            (window as any).saveUrl(url);
          }
        }
      };

      const processMutation = (mutation) => {
        mutation.addedNodes.forEach(processNode);
      };

      const observer = new MutationObserver((mutations) => {
        mutations.forEach(processMutation);
      });

      observer.observe(document.body, { childList: true, subtree: true });
      return observer;
    });
  }

  /**
   * Scrolls the gallery page until the required number of image URLs are captured.
   * @param page - The Puppeteer gallery page instance.
   * @param requiredSetSize - The required number of image URLs to capture.
   */
  private async scrollPageUntilSetIsFilled(
    page: Page,
    requiredSetSize: number,
  ) {
    await page.evaluate(async (requiredSetSize) => {
      const scrollStep = 100;
      const scrollTimeout = 500;

      return new Promise<void>((resolve) => {
        const scrollInterval = setInterval(async () => {
          window.scrollBy(0, scrollStep);
          const currentSetSize = await window['getSetSize']();
          if (currentSetSize >= requiredSetSize) {
            clearInterval(scrollInterval);
            resolve();
          }
        }, scrollTimeout);
      });
    }, requiredSetSize);
  }

  /**
   * Waits until the AI-generated image data is fully loaded on the page.
   * @param page - The Puppeteer page instance.
   */
  private async waitUntilImageDataLoaded(page: Page): Promise<void> {
    await page.waitForSelector('img.select-none');
  }

  /**
   * Extracts AI-generated image data from the provided HTML content.
   * @param html - The HTML content of the page.
   * @returns An array of AI-generated image documents.
   */
  private extractImageData(html: string): AiGeneratedImage[] {
    const $ = load(html);
    const imagesIds = this.extractImagesIds($);
    const imagesUrls = this.extractImagesUrls($);
    const prompt = this.extractImagePrompt($);
    const model = this.extractImageModel($);
    const dimensions = this.extractImageDimensions($);
    return imagesIds.map((id, index) => ({
      provider: this.provider,
      model,
      prompt,
      originalId: id,
      imageUrl: imagesUrls[index],
      format: 'jpg',
      dimensions,
    }));
  }

  /**
   * Extracts image IDs from the HTML content.
   * @param $ - The Cheerio API instance.
   * @returns An array of image IDs as strings.
   */
  private extractImagesIds($: CheerioAPI): string[] {
    return $('img.select-none')
      .map((_, imageAnchor) => $(imageAnchor).attr('src').split('/').pop())
      .get();
  }

  /**
   * Extracts image URLs from the HTML content.
   * @param $ - The Cheerio API instance.
   * @returns An array of image URLs as strings.
   */
  private extractImagesUrls($: CheerioAPI): string[] {
    return $('img.select-none')
      .map((_, imageAnchor) =>
        $(imageAnchor)
          .attr('src')
          .replace(/full_webp/g, 'full_jpg'),
      )
      .get();
  }

  /**
   * Extracts the generative model information from the HTML content.
   * @param $ - The Cheerio API instance.
   * @returns The model information as a string.
   */
  private extractImageModel($: CheerioAPI): string {
    return $('div:contains("Model") + div.text-sm').text().trim();
  }

  /**
   * Extracts the dimensions of the image from the HTML content.
   * @param $ - The Cheerio API instance.
   * @returns An object containing the width and height of the image.
   */
  private extractImageDimensions($: CheerioAPI): {
    width: number;
    height: number;
  } {
    const dimensionsText = $('div:contains("Dimensions") + div.text-sm')
      .text()
      .trim()
      .replace(/\s+/g, '');
    const [width, height] = dimensionsText
      .split('×')
      .map((dim) => parseInt(dim, 10));
    return {
      width,
      height,
    };
  }

  /**
   * Extracts the generation prompt from the HTML content.
   * @param $ - The Cheerio API instance.
   * @returns The prompt as a string.
   */
  private extractImagePrompt($: CheerioAPI) {
    return $('div.mt-6 p').text().trim();
  }
}
