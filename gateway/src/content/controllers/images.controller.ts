import { Controller, Delete, Get, Next, Post, Req, Res } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { ProxyService } from '../../shared/services/proxy.service';
import { NextFunction, Request, Response } from 'express';
import {
  ApiBearerAuth,
  ApiBody,
  ApiParam,
  ApiQuery,
  ApiTags,
} from '@nestjs/swagger';
import { CreateImageDto } from '../dto/create-image.dto';
import { GetImagesDto } from '../dto/get-images.dto';
import { RequestHandler } from 'http-proxy-middleware';
import { IncomingMessage, ServerResponse } from 'http';

@ApiTags('content')
@Controller('content/images')
export class ImagesController {
  private readonly proxy: RequestHandler<
    IncomingMessage,
    ServerResponse,
    NextFunction
  >;

  constructor(proxyService: ProxyService, configService: ConfigService) {
    const CONTENT_SERVICE_URL = configService.get<string>(
      'CONTENT_SERVICE_URL',
    );
    this.proxy = proxyService.createProxy(CONTENT_SERVICE_URL, {
      '^/content': '',
    });
  }

  @Post()
  @ApiBearerAuth('Access Token')
  @ApiBody({ type: CreateImageDto })
  async createImage(
    @Req() req: Request,
    @Res() res: Response,
    @Next() next: NextFunction,
  ) {
    this.proxy(req, res, next);
  }

  @Get()
  @ApiBearerAuth('Access Token')
  @ApiQuery({ type: GetImagesDto })
  async getImages(
    @Req() req: Request,
    @Res() res: Response,
    @Next() next: NextFunction,
  ) {
    this.proxy(req, res, next);
  }

  @Get(':id')
  @ApiParam({ name: 'id', type: 'string' })
  async getImage(
    @Req() req: Request,
    @Res() res: Response,
    @Next() next: NextFunction,
  ) {
    this.proxy(req, res, next);
  }

  @Delete(':id')
  @ApiBearerAuth('Access Token')
  @ApiParam({ name: 'id', type: 'string' })
  async deleteImage(
    @Req() req: Request,
    @Res() res: Response,
    @Next() next: NextFunction,
  ) {
    this.proxy(req, res, next);
  }
}
