import { Controller, Get, Next, Post, Req, Res } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { ApiBearerAuth, ApiBody, ApiParam, ApiQuery, ApiTags } from "@nestjs/swagger";
import { RequestHandler } from 'http-proxy-middleware';
import { IncomingMessage, ServerResponse } from 'http';
import { NextFunction, Request, Response } from 'express';
import { ProxyService } from '../../shared/services/proxy.service';
import { GetAggregationJobsDto } from '../dto/get-aggregation-jobs.dto';
import { CreateAggregationJobDto } from '../dto/create-aggregation-job.dto';

@ApiTags('aggregation')
@ApiBearerAuth('Access Token')
@Controller('aggregation/jobs')
export class JobsController {
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

  @Post()
  @ApiBody({ type: CreateAggregationJobDto })
  async createJob(
    @Req() req: Request,
    @Res() res: Response,
    @Next() next: NextFunction,
  ) {
    this.proxy(req, res, next);
  }

  @Get()
  @ApiQuery({ type: GetAggregationJobsDto })
  async getJobs(
    @Req() req: Request,
    @Res() res: Response,
    @Next() next: NextFunction,
  ) {
    this.proxy(req, res, next);
  }

  @Get(':id')
  @ApiParam({ name: 'id', type: 'string' })
  async getJob(
    @Req() req: Request,
    @Res() res: Response,
    @Next() next: NextFunction,
  ) {
    this.proxy(req, res, next);
  }
}
