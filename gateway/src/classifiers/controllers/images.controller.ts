import { Controller, Next, Post, Req, Res, UseGuards } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { RequestHandler } from 'http-proxy-middleware';
import { IncomingMessage, ServerResponse } from 'http';
import { NextFunction, Request, Response } from 'express';
import { ProxyService } from '../../shared/services/proxy.service';
import {
  ApiBearerAuth,
  ApiBody,
  ApiConsumes,
  ApiParam,
  ApiTags,
} from '@nestjs/swagger';
import { JwtAuthGuard } from '../../shared/guards/jwt-auth.guard';

@ApiTags('image classifiers')
@ApiBearerAuth('Access Token')
@UseGuards(JwtAuthGuard)
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
  @ApiConsumes('multipart/form-data')
  @ApiBody({
    description: 'Upload a single file',
    schema: {
      type: 'object',
      properties: {
        file: {
          type: 'string',
          format: 'binary',
        },
      },
    },
  })
  async classifyImage(
    @Req() req: Request,
    @Res() res: Response,
    @Next() next: NextFunction,
  ) {
    this.proxy(req, res, next);
  }

  @Post(':model/prediction')
  @ApiConsumes('multipart/form-data')
  @ApiBody({
    description: 'Upload a single file',
    schema: {
      type: 'object',
      properties: {
        file: {
          type: 'string',
          format: 'binary',
        },
      },
    },
  })
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
