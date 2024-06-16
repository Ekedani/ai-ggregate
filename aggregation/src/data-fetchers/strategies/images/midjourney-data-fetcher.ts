import { ImageFetcher } from '../image-fetcher.interface';
import { AiGeneratedImage } from '../../../shared/schemas/ai-generated-image.schema';
import { CheerioAPI, load } from 'cheerio';
import { Page } from 'puppeteer';

// eslint-disable-next-line @typescript-eslint/no-var-requires
const puppeteer = require('puppeteer-extra');
// eslint-disable-next-line @typescript-eslint/no-var-requires
const StealthPlugin = require('puppeteer-extra-plugin-stealth');

export class MidjourneyDataFetcher implements ImageFetcher {
  provider = {
    name: 'Midjourney',
    isTrusted: true,
  };

  /**
   * Fetches AI-generated images from the Midjourney SPA.
   * @returns An array of AI-generated image documents.
   */
  public async fetchData(): Promise<AiGeneratedImage[]> {
    puppeteer.use(StealthPlugin());
    const browser = await puppeteer.launch({
      args: ['--no-sandbox', '--disable-setuid-sandbox'],
      headless: true,
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
   * Scrapes image data from the Midjourney showcase page.
   * @param page - The Puppeteer page instance.
   * @returns An array of AI-generated image documents.
   */
  private async scrapeImagesData(page: Page): Promise<AiGeneratedImage[]> {
    await page.goto('https://www.midjourney.com/showcase');
    const detailPageUrls = await this.monitorAndCaptureUrls(page);
    const imagesData: AiGeneratedImage[] = [];
    for (const url of detailPageUrls) {
      await page.goto(url);
      await this.waitUntilImageDataLoaded(page);
      const detailHtml = await page.content();
      const currentImagesData = this.extractImageData(detailHtml);
      currentImagesData.forEach(
        (imageData) => (imageData.publicationUrl = url),
      );
      imagesData.push(...currentImagesData);
    }

    const existingImagesData = [];
    for (const data of imagesData) {
      const exists = await this.checkIfImageExists(data.imageUrl);
      if (exists) {
        existingImagesData.push(data);
      }
    }

    return existingImagesData;
  }

  /**
   * Monitors the page for new image URLs and captures them.
   * @param page - The Puppeteer page instance.
   * @returns An array of captured image URLs.
   */
  private async monitorAndCaptureUrls(page: Page): Promise<string[]> {
    const urls = new Set<string>();

    await page.exposeFunction('saveUrl', (url: string) => {
      urls.add(url);
    });

    const processNode = (node: Node) => {
      if (
        node instanceof HTMLElement &&
        node.matches('div:has(> a.block.bg-cover)')
      ) {
        const linkElement = node.querySelector('a.block.bg-cover');
        if (linkElement) {
          const fullUrl = `https://www.midjourney.com${linkElement.getAttribute('href')}`;
          (window as any).saveUrl(fullUrl);
        }
      }
    };

    const mutationCallback = (mutations: MutationRecord[]) => {
      mutations.forEach((mutation) => {
        mutation.addedNodes.forEach(processNode);
        mutation.removedNodes.forEach(processNode);
      });
    };

    const observerHandle = await page.evaluateHandle(() => {
      const observer = new MutationObserver((window as any).mutationCallback);
      observer.observe(document.body, { childList: true, subtree: true });
      return observer;
    });

    await page.exposeFunction('mutationCallback', mutationCallback);
    await this.scrollGalleryToEnd(page, 'pageScroll');
    await observerHandle.evaluate((observer: MutationObserver) =>
      observer.disconnect(),
    );

    return Array.from(urls);
  }

  /**
   * Scrolls the showcase gallery to the end to load all images.
   * @param page - The Puppeteer page instance.
   * @param galleryId - The ID of the gallery element.
   */
  private async scrollGalleryToEnd(page: Page, galleryId: string) {
    await page.evaluate(async (elementId) => {
      const gallery = document.getElementById(elementId);

      if (!gallery) return;

      return new Promise<void>((resolve) => {
        const scrollStep = 100;
        const scrollTimeout = 500;

        let lastGalleryScrollTop = gallery.scrollTop;
        const scrollInterval = setInterval(() => {
          gallery.scrollBy(0, scrollStep);
          if (gallery.scrollTop === lastGalleryScrollTop) {
            clearInterval(scrollInterval);
            resolve();
          } else {
            lastGalleryScrollTop = gallery.scrollTop;
          }
        }, scrollTimeout);
      });
    }, galleryId);
  }

  /**
   * Waits until the AI-generated image data is fully loaded on the showcase.
   * @param page - The Puppeteer page instance.
   */
  private async waitUntilImageDataLoaded(page: Page): Promise<void> {
    await page.waitForSelector('img.absolute.w-full.h-full');
  }

  /**
   * Extracts AI-generated image data from the provided HTML content.
   * @param html - The HTML content of the page.
   * @returns An array of AI-generated image documents.
   */
  private extractImageData(html: string): AiGeneratedImage[] {
    const $ = load(html);
    const author = this.extractAuthor($);
    const createdAt = this.extractCreationDate($);
    const imagesIds = this.extractImagesIds($);
    const imagesUrls = this.extractImagesUrls($);
    const prompt = this.extractPrompt($);
    const technicalTags = this.extractTechnicalTags($);
    return imagesIds.map((imageId, index) => ({
      provider: this.provider,
      originalId: imageId,
      prompt,
      model: 'Midjourney',
      author,
      createdAt,
      imageUrl: imagesUrls[index],
      format: 'png',
      technicalTags,
    }));
  }

  /**
   * Extracts the author information from the HTML content.
   * @param $ - The Cheerio API instance.
   * @returns The author name as a string.
   */
  private extractAuthor($: CheerioAPI): string {
    return $(
      'div.whitespace-nowrap.pointer-events-auto.cursor-pointer span',
    ).text();
  }

  /**
   * Extracts the creation date from the HTML content.
   * @param $ - The Cheerio API instance.
   * @returns The creation date as a Date object.
   */
  private extractCreationDate($: CheerioAPI): Date {
    const dateText = $('span > div.cursor-help').parent().attr('title');
    const currentYear = new Date().getFullYear();
    return new Date(`${dateText} ${currentYear}`);
  }

  /**
   * Extracts the image IDs from the HTML content.
   * @param $ - The Cheerio API instance.
   * @returns An array of image IDs.
   */
  private extractImagesIds($: CheerioAPI): string[] {
    const originalUrl = $('img.absolute.w-full.h-full').attr('src');
    const parsedUrl = new URL(originalUrl);
    const baseUuid = parsedUrl.pathname.split('/')[1];
    return Array.from({ length: 4 }, (_, i) => `${baseUuid}/0_${i}`);
  }

  /**
   * Extracts the image URLs from the HTML content.
   * @param $ - The Cheerio API instance.
   * @returns An array of image URLs.
   */
  private extractImagesUrls($: CheerioAPI): string[] {
    const originalUrl = $('img.absolute.w-full.h-full').attr('src');
    const parsedUrl = new URL(originalUrl);
    const baseUrl = `${parsedUrl.origin}${parsedUrl.pathname.split('/').slice(0, -1).join('/')}`;
    return Array.from({ length: 4 }, (_, i) => `${baseUrl}/0_${i}.png`);
  }

  /**
   * Extracts the image generation prompt from the HTML content.
   * @param $ - The Cheerio API instance.
   * @returns The prompt as a string.
   */
  private extractPrompt($: CheerioAPI): string {
    const imagesInPrompt = $('a[title="Image Prompt"]')
      .map((_, imageAnchor) => $(imageAnchor).attr('href'))
      .get()
      .join(' ');

    const tagsInPrompt = $('button[title="Use in prompt"]')
      .map((_, tagButton) => $(tagButton).text())
      .get()
      .join(' ');

    const mainPrompt = $('.break-word p')
      .map((_, promptParagraph) => $(promptParagraph).text())
      .get()
      .join(' ');

    return `${mainPrompt} ${imagesInPrompt} ${tagsInPrompt}`;
  }

  /**
   * Extracts the technical generation tags from the HTML content.
   * @param $ - The Cheerio API instance.
   * @returns An array of technical tags.
   */
  private extractTechnicalTags($: CheerioAPI): string[] {
    return $('button[title="Use in prompt"]')
      .map((_, tagButton) => $(tagButton).text().replace(/--/g, '').trim())
      .get();
  }

  /**
   * Checks if the scrapped image exists at the provided URL.
   * @param url - The URL of the image.
   * @returns A boolean indicating whether the image exists.
   */
  private async checkIfImageExists(url: string): Promise<boolean> {
    try {
      const response = await fetch(url, {
        headers: {
          'sec-ch-ua':
            '"Google Chrome";v="123", "Not:A-Brand";v="8", "Chromium";v="123"',
        },
        referrerPolicy: 'strict-origin-when-cross-origin',
        method: 'HEAD',
      });
      return response.status !== 404;
    } catch (error) {
      return false;
    }
  }
}
