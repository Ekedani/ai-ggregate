import { Test, TestingModule } from '@nestjs/testing';
import { HttpService } from '@nestjs/axios';
import { of } from 'rxjs';
import { CivitaiDataFetcher } from './civitai-data-fetcher';
import { AxiosResponse } from 'axios';

describe('CivitaiDataFetcher', () => {
  let service: CivitaiDataFetcher;
  let httpService: HttpService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        CivitaiDataFetcher,
        {
          provide: HttpService,
          useValue: {
            get: jest.fn(),
          },
        },
      ],
    }).compile();

    service = module.get<CivitaiDataFetcher>(CivitaiDataFetcher);
    httpService = module.get<HttpService>(HttpService);
  });

  describe('fetchData', () => {
    it('should return an array of AiGeneratedImage', async () => {
      const mockImages = {
        id: 1,
        url: 'http://example.com/image.jpg',
        width: 800,
        height: 600,
        createdAt: new Date(),
        username: 'user123',
        meta: { prompt: 'a sunset' },
      };
      const response: AxiosResponse = {
        data: {
          items: [mockImages],
          metadata: { nextCursor: 2 },
        },
        status: 200,
        statusText: 'OK',
        headers: {},
        config: {
          headers: undefined,
        },
      };

      jest.spyOn(httpService, 'get').mockReturnValue(of(response));
      const result = await service.fetchData();
      expect(result).toBeInstanceOf(Array);
      expect(result).toHaveLength(1);
      expect(result[0].imageUrl).toEqual('http://example.com/image.jpg');
    });
  });

  describe('fetchCivitaiData', () => {
    it('should handle pagination correctly', async () => {
      const responsePage1: AxiosResponse = {
        data: {
          items: [
            {
              id: 1,
              url: 'http://example.com/image1.jpg',
              createdAt: new Date(Date.now() - 1000),
              username: 'user123',
              meta: { prompt: 'a sunset' },
            },
          ],
          metadata: { nextCursor: 2 },
        },
        status: 200,
        statusText: 'OK',
        headers: {},
        config: {
          headers: undefined,
        },
      };
      const responsePage2: AxiosResponse = {
        data: {
          items: [],
          metadata: {},
        },
        status: 200,
        statusText: 'OK',
        headers: {},
        config: {
          headers: undefined,
        },
      };

      jest
        .spyOn(httpService, 'get')
        .mockReturnValueOnce(of(responsePage1))
        .mockReturnValueOnce(of(responsePage2));

      const result = await service.fetchData();
      expect(result).toHaveLength(1);
      expect(httpService.get).toHaveBeenCalledTimes(2);
    });
  });
});
