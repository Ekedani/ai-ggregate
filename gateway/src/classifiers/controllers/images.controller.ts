import { Controller } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { RequestHandler } from 'http-proxy-middleware';
import { IncomingMessage, ServerResponse } from 'http';
import { NextFunction } from 'express';
import { ProxyService } from '../../shared/services/proxy.service';

@Controller('classifiers/images')
export class ImagesController {
  private readonly proxy: RequestHandler<
    IncomingMessage,
    ServerResponse,
    NextFunction
  >;

  constructor(configService: ConfigService, proxyService: ProxyService) {
    const AI_IMAGE_CLASSIFIER_SERVICE_URL = configService.get<string>(
      'AI_IMAGE_CLASSIFIER_SERVICE_URL',
    );

    this.proxy = proxyService.createProxy(AI_IMAGE_CLASSIFIER_SERVICE_URL, {
      '^/classifiers': '',
    });
  }
}
