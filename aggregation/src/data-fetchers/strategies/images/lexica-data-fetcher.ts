import { ImageFetcher } from '../image-fetcher.interface';
import { AiGeneratedImage } from '../../../shared/schemas/ai-generated-image.schema';
import puppeteer, { Page } from 'puppeteer';
import { CheerioAPI, load } from 'cheerio';

export class LexicaDataFetcher implements ImageFetcher {
  provider = {
    name: 'Lexica',
    isTrusted: false,
  };

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

  private async setMutationObserver(page: Page) {
    return page.evaluateHandle(() => {
      const observer = new MutationObserver((mutations) => {
        mutations.forEach((mutation) => {
          mutation.addedNodes.forEach((node) => {
            console.log(node);
            if (
              node instanceof HTMLElement &&
              node.matches('div[role="gridcell"]')
            ) {
              const url = node.querySelector('a')?.href;
              if (url) {
                (window as any).saveUrl(url);
              }
            }
          });
        });
      });
      observer.observe(document.body, { childList: true, subtree: true });
      return observer;
    });
  }

  private async scrollPageUntilSetIsFilled(page: Page, requiredSize: number) {
    await page.evaluate(async (requiredSize) => {
      return new Promise<void>((resolve) => {
        const interval = setInterval(async () => {
          window.scrollBy(0, 100);
          const currentSetSize = await window['getSetSize']();
          console.log(currentSetSize);
          if (currentSetSize >= requiredSize) {
            clearInterval(interval);
            resolve();
          }
        }, 500);
      });
    }, requiredSize);
  }

  private async waitUntilImageDataLoaded(page: Page): Promise<void> {
    await page.waitForSelector('img.select-none');
  }

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

  private extractImagesIds($: CheerioAPI): string[] {
    return $('img.select-none')
      .map((_, imageAnchor) => $(imageAnchor).attr('src').split('/').pop())
      .get();
  }

  private extractImagesUrls($: CheerioAPI): string[] {
    return $('img.select-none')
      .map((_, imageAnchor) =>
        $(imageAnchor)
          .attr('src')
          .replace(/full_webp/g, 'full_jpg'),
      )
      .get();
  }

  private extractImageModel($: CheerioAPI): string {
    return $('div:contains("Model") + div.text-sm').text().trim();
  }

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

  private extractImagePrompt($: CheerioAPI) {
    return $('div.mt-6 p').text().trim();
  }
}
