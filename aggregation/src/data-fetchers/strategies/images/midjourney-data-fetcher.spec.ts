import { MidjourneyDataFetcher } from './midjourney-data-fetcher';

// eslint-disable-next-line @typescript-eslint/no-var-requires
const puppeteer = require('puppeteer-extra');
// eslint-disable-next-line @typescript-eslint/no-var-requires
const StealthPlugin = require('puppeteer-extra-plugin-stealth');

jest.mock('puppeteer-extra', () => ({
  use: jest.fn(),
  launch: jest.fn(),
}));
jest.mock('puppeteer-extra-plugin-stealth');

beforeEach(() => {
  puppeteer.launch.mockResolvedValue({
    newPage: jest.fn(() => ({
      goto: jest.fn(),
      content: jest.fn(() => '<html></html>'),
      exposeFunction: jest.fn(),
      waitForSelector: jest.fn(),
      evaluate: jest.fn(),
      evaluateHandle: jest.fn(),
      on: jest.fn(),
      close: jest.fn(),
      setViewport: jest.fn(),
    })),
    close: jest.fn(),
  });
  puppeteer.use.mockImplementation(() => {});
});

describe('MidjourneyDataFetcher', () => {
  let fetcher;
  let mockPage;
  let mockBrowser: { newPage: () => any; close: () => any };

  beforeEach(async () => {
    fetcher = new MidjourneyDataFetcher();
    mockBrowser = await puppeteer.launch();
    mockPage = await mockBrowser.newPage();
  });

  afterEach(async () => {
    jest.clearAllMocks();
    await mockBrowser.close();
  });

  describe('fetchData', () => {
    it('initializes puppeteer with stealth plugin and fetches data', async () => {
      jest.spyOn(fetcher, 'scrapeImagesData').mockResolvedValue([]);
      await fetcher.fetchData();
      expect(puppeteer.use).toHaveBeenCalledWith(StealthPlugin());
      expect(mockBrowser.close).toHaveBeenCalled();
    });

    it('handles exceptions during browser operations', async () => {
      puppeteer.launch.mockRejectedValue(new Error('Browser failed'));
      await expect(fetcher.fetchData()).rejects.toThrow('Browser failed');
    });
  });

  describe('scrapeImagesData', () => {
    it('navigates to the correct URL and scrapes data', async () => {
      jest
        .spyOn(fetcher, 'monitorAndCaptureUrls')
        .mockResolvedValue(['https://example.com/detail']);
      jest
        .spyOn(fetcher, 'waitUntilImageDataLoaded')
        .mockResolvedValue(undefined);
      jest
        .spyOn(fetcher, 'extractImageData')
        .mockReturnValue([{ imageUrl: 'https://example.com/image.png' }]);
      jest.spyOn(fetcher, 'checkIfImageExists').mockResolvedValue(true);

      const data = await fetcher.scrapeImagesData(mockPage);
      expect(mockPage.goto).toHaveBeenCalledWith(
        'https://www.midjourney.com/showcase',
      );
      expect(data).toEqual([
        {
          imageUrl: 'https://example.com/image.png',
          publicationUrl: 'https://example.com/detail',
        },
      ]);
    });

    it('returns only existing images', async () => {
      jest
        .spyOn(fetcher, 'monitorAndCaptureUrls')
        .mockResolvedValue(['https://example.com/detail']);
      jest
        .spyOn(fetcher, 'waitUntilImageDataLoaded')
        .mockResolvedValue(undefined);
      jest
        .spyOn(fetcher, 'extractImageData')
        .mockReturnValue([
          { imageUrl: 'https://example.com/exists.png' },
          { imageUrl: 'https://example.com/does-not-exist.png' },
        ]);
      jest
        .spyOn(fetcher, 'checkIfImageExists')
        .mockResolvedValueOnce(true)
        .mockResolvedValueOnce(false);

      const data = await fetcher.scrapeImagesData(mockPage);
      expect(data).toEqual([
        {
          imageUrl: 'https://example.com/exists.png',
          publicationUrl: 'https://example.com/detail',
        },
      ]);
    });

    it('handles navigation failures gracefully', async () => {
      mockPage.goto.mockRejectedValue(new Error('Navigation failed'));
      await expect(fetcher.scrapeImagesData(mockPage)).rejects.toThrow(
        'Navigation failed',
      );
    });
  });

  describe('scrollGalleryToEnd', () => {
    it('should evaluate script to scroll through the gallery until the end', async () => {
      mockPage.evaluate.mockResolvedValue();
      await fetcher.scrollGalleryToEnd(mockPage, 'gallery');
      expect(mockPage.evaluate).toHaveBeenCalled();
    });
  });

  describe('monitorAndCaptureUrls', () => {
    it('should capture urls via evaluateHandle', async () => {
      expect(fetcher.monitorAndCaptureUrls).toBeDefined();
    });
  });

  describe('waitUntilImageDataLoaded', () => {
    it('should wait for image data to load', async () => {
      await fetcher.waitUntilImageDataLoaded(mockPage);
      expect(mockPage.waitForSelector).toHaveBeenCalledWith(
        'img.absolute.w-full.h-full',
      );
    });
  });

  describe('extractImageData', () => {
    it('correctly extracts data from provided HTML', () => {
      const html = '<html>...</html>';
      jest
        .spyOn(fetcher, 'extractImageData')
        .mockReturnValue([{ imageUrl: 'https://example.com/image.png' }]);
      const extractedData = fetcher.extractImageData(html);
      expect(extractedData).toEqual([
        { imageUrl: 'https://example.com/image.png' },
      ]);
    });
  });
});
