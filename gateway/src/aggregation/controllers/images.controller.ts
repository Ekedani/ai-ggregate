import {
  Controller,
  Get,
  Next,
  Put,
  Req,
  Res,
  UseGuards,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import {
  ApiBearerAuth,
  ApiBody,
  ApiParam,
  ApiQuery,
  ApiTags,
} from '@nestjs/swagger';
import { RequestHandler } from 'http-proxy-middleware';
import { IncomingMessage, ServerResponse } from 'http';
import { NextFunction, Request, Response } from 'express';
import { GetImagesDto } from '../dto/get-images.dto';
import { JwtAuthGuard } from '../../shared/guards/jwt-auth.guard';
import { BulkImageModerationDto } from '../dto/bulk-image-moderation.dto';
import { ProxyService } from '../../shared/services/proxy.service';

@ApiTags('aggregation')
@ApiBearerAuth('Access Token')
@Controller('aggregation/images')
export class ImagesController {
  private readonly proxy: RequestHandler<
    IncomingMessage,
    ServerResponse,
    NextFunction
  >;

  constructor(configService: ConfigService, proxyService: ProxyService) {
    const AGGREGATION_SERVICE_URL = configService.get<string>(
      'AGGREGATION_SERVICE_URL',
    );
    this.proxy = proxyService.createProxy(AGGREGATION_SERVICE_URL, {
      '^/aggregation': '',
    });
  }

  @Get()
  @ApiQuery({ type: GetImagesDto })
  @UseGuards(JwtAuthGuard)
  async getImages(
    @Req() req: Request,
    @Res() res: Response,
    @Next() next: NextFunction,
  ) {
    this.proxy(req, res, next);
  }

  @Get(':id')
  @ApiParam({ name: 'id', type: 'string' })
  @UseGuards(JwtAuthGuard)
  async getImage(
    @Req() req: Request,
    @Res() res: Response,
    @Next() next: NextFunction,
  ) {
    this.proxy(req, res, next);
  }

  @Put('approval')
  @ApiBody({ type: BulkImageModerationDto })
  @UseGuards(JwtAuthGuard)
  async approveImages(
    @Req() req: Request,
    @Res() res: Response,
    @Next() next: NextFunction,
  ) {
    this.proxy(req, res, next);
  }

  @Put('rejection')
  @ApiBody({ type: BulkImageModerationDto })
  @UseGuards(JwtAuthGuard)
  async rejectImages(
    @Req() req: Request,
    @Res() res: Response,
    @Next() next: NextFunction,
  ) {
    this.proxy(req, res, next);
  }
}
