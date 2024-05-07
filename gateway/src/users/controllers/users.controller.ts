import { Controller, Get, Next, Req, Res } from '@nestjs/common';
import { RequestHandler } from 'http-proxy-middleware';
import { IncomingMessage, ServerResponse } from 'http';
import { NextFunction, Request, Response } from 'express';
import { ProxyService } from '../../shared/services/proxy.service';
import { ConfigService } from '@nestjs/config';
import { ApiParam, ApiTags } from '@nestjs/swagger';

@ApiTags('users')
@Controller('users')
export class UsersController {
  private readonly proxy: RequestHandler<
    IncomingMessage,
    ServerResponse,
    NextFunction
  >;

  constructor(proxyService: ProxyService, configService: ConfigService) {
    const USERS_SERVICE_URL = configService.get<string>('USERS_SERVICE_URL');
    this.proxy = proxyService.createProxy(USERS_SERVICE_URL, {
      '^': '',
    });
  }

  @Get()
  async findAll(
    @Req() req: Request,
    @Res() res: Response,
    @Next() next: NextFunction,
  ) {
    this.proxy(req, res, next);
  }

  @Get(':id')
  @ApiParam({ name: 'id', type: 'string' })
  async findOne(
    @Req() req: Request,
    @Res() res: Response,
    @Next() next: NextFunction,
  ) {
    this.proxy(req, res, next);
  }
}
