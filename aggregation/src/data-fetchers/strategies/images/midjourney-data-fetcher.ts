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

  private async monitorAndCaptureUrls(page: Page): Promise<string[]> {
    const urls = new Set<string>();
    await page.exposeFunction('saveUrl', (url: string) => {
      urls.add(url);
    });

    const observerHandle = await page.evaluateHandle(() => {
      const observer = new MutationObserver((mutations) => {
        mutations.forEach((mutation) => {
          const mutatedImageNodesCallback = (node: Node) => {
            if (
              node instanceof HTMLElement &&
              node.matches('div:has(> a.block.bg-cover)')
            ) {
              const linkElement = node.querySelector('a.block.bg-cover');
              const fullUrl = `https://www.midjourney.com${linkElement.getAttribute('href')}`;
              (window as any).saveUrl(fullUrl);
            }
          };
          mutation.addedNodes.forEach(mutatedImageNodesCallback);
          mutation.removedNodes.forEach(mutatedImageNodesCallback);
        });
      });
      observer.observe(document.body, { childList: true, subtree: true });
      return observer;
    });

    await this.scrollGalleryToEnd(page, 'pageScroll');
    await observerHandle.evaluate((observer: MutationObserver) =>
      observer.disconnect(),
    );
    return Array.from(urls);
  }

  private async scrollGalleryToEnd(page: Page, elementId: string) {
    await page.evaluate(async (elementId) => {
      const galleryElement = document.getElementById(elementId);
      return new Promise<void>((resolve) => {
        let lastScrollTop = galleryElement.scrollTop;
        const interval = setInterval(() => {
          galleryElement.scrollBy(0, 100);
          if (galleryElement.scrollTop === lastScrollTop) {
            clearInterval(interval);
            resolve();
          } else {
            lastScrollTop = galleryElement.scrollTop;
          }
        }, 500);
      });
    }, elementId);
  }

  private async waitUntilImageDataLoaded(page: Page): Promise<void> {
    await page.waitForSelector('img.absolute.w-full.h-full');
  }

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

  private extractAuthor($: CheerioAPI): string {
    return $(
      'div.whitespace-nowrap.pointer-events-auto.cursor-pointer span',
    ).text();
  }

  private extractCreationDate($: CheerioAPI): Date {
    const dateText = $('span > div.cursor-help').parent().attr('title');
    const currentYear = new Date().getFullYear();
    return new Date(`${dateText} ${currentYear}`);
  }

  private extractImagesIds($: CheerioAPI): string[] {
    const originalUrl = $('img.absolute.w-full.h-full').attr('src');
    const parsedUrl = new URL(originalUrl);
    const baseUuid = parsedUrl.pathname.split('/')[1];
    return Array.from({ length: 4 }, (_, i) => `${baseUuid}/0_${i}`);
  }

  private extractImagesUrls($: CheerioAPI): string[] {
    const originalUrl = $('img.absolute.w-full.h-full').attr('src');
    const parsedUrl = new URL(originalUrl);
    const baseUrl = `${parsedUrl.origin}${parsedUrl.pathname.split('/').slice(0, -1).join('/')}`;
    return Array.from({ length: 4 }, (_, i) => `${baseUrl}/0_${i}.png`);
  }

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

  private extractTechnicalTags($: CheerioAPI): string[] {
    return $('button[title="Use in prompt"]')
      .map((_, tagButton) => $(tagButton).text().replace(/--/g, '').trim())
      .get();
  }

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
