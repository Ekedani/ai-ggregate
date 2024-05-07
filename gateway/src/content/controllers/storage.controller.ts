import { Controller, Get, Next, Req, Res } from '@nestjs/common';
import { ProxyService } from '../../shared/services/proxy.service';
import { ApiParam, ApiTags } from '@nestjs/swagger';
import { ConfigService } from '@nestjs/config';
import { NextFunction, Request, Response } from 'express';
import { IncomingMessage, ServerResponse } from 'http';
import { RequestHandler } from 'http-proxy-middleware';

@ApiTags('content')
@Controller('content/storage')
export class StorageController {
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

  @Get('images/:storageKey')
  @ApiParam({ name: 'storageKey', type: 'string' })
  async getImage(
    @Req() req: Request,
    @Res() res: Response,
    @Next() next: NextFunction,
  ) {
    this.proxy(req, res, next);
  }
}
