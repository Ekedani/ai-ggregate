import { Controller, Next, Post, Req, Res, UseGuards } from '@nestjs/common';
import { RegisterDto } from '../dto/register.dto';
import { LoginDto } from '../dto/login.dto';
import { JwtAuthGuard } from '../../shared/guards/jwt-auth.guard';
import { ConfigService } from '@nestjs/config';
import { ApiBearerAuth, ApiBody, ApiTags } from '@nestjs/swagger';
import { RequestHandler } from 'http-proxy-middleware';
import { IncomingMessage, ServerResponse } from 'http';
import { NextFunction, Request, Response } from 'express';
import { ProxyService } from '../../shared/services/proxy.service';

@ApiTags('auth')
@Controller('auth')
export class AuthController {
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

  @Post('register')
  @ApiBody({ type: RegisterDto })
  async register(
    @Req() req: Request,
    @Res() res: Response,
    @Next() next: NextFunction,
  ) {
    this.proxy(req, res, next);
  }

  @Post('login')
  @ApiBody({ type: LoginDto })
  async login(
    @Req() req: Request,
    @Res() res: Response,
    @Next() next: NextFunction,
  ) {
    this.proxy(req, res, next);
  }

  @Post('refresh')
  async refresh(
    @Req() req: Request,
    @Res() res: Response,
    @Next() next: NextFunction,
  ) {
    this.proxy(req, res, next);
  }

  @ApiBearerAuth('Access Token')
  @UseGuards(JwtAuthGuard)
  @Post('logout')
  async logout(
    @Req() req: Request,
    @Res() res: Response,
    @Next() next: NextFunction,
  ) {
    this.proxy(req, res, next);
  }
}
