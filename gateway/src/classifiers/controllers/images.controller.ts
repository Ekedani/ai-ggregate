import { Controller, Next, Post, Req, Res } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { RequestHandler } from 'http-proxy-middleware';
import { IncomingMessage, ServerResponse } from 'http';
import { NextFunction, Request, Response } from 'express';
import { ProxyService } from '../../shared/services/proxy.service';
import { ApiParam, ApiTags } from '@nestjs/swagger';

@ApiTags('image classifiers')
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
      '^/classifiers/images': '',
    });
  }

  @Post('prediction')
  async classifyImage(
    @Req() req: Request,
    @Res() res: Response,
    @Next() next: NextFunction,
  ) {
    this.proxy(req, res, next);
  }

  @Post(':model/prediction')
  @ApiParam({
    name: 'model',
    enum: [
      'resnet34_image_classifier_v1',
      'resnet34_image_classifier_v2',
      'resnet34_image_classifier_v3',
      'resnet34_image_classifier_v4',
    ],
  })
  async classifyImageUsingModel(
    @Req() req: Request,
    @Res() res: Response,
    @Next() next: NextFunction,
  ) {
    this.proxy(req, res, next);
  }
}