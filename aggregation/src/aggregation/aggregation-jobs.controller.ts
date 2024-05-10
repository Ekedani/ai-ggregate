import {
  Body,
  Controller,
  Get,
  Param,
  Post,
  Query,
  UseGuards,
} from '@nestjs/common';
import { AggregationService } from './aggregation.service';
import { AggregationJob } from './schemas/aggregation-job.schema';
import { CreateAggregationJobDto } from './dto/create-aggregation-job.dto';
import { GetAggregationJobsDto } from './dto/get-aggregation-jobs.dto';
import { JwtAuthGuard } from '../shared/guards/jwt-auth.guard';
import { ValidateMongoIdPipe } from '../shared/pipes/validate-mongo-id.pipe';

@UseGuards(JwtAuthGuard)
@Controller('jobs')
export class AggregationJobsController {
  constructor(private readonly aggregationService: AggregationService) {}

  @Post()
  public async createManualAggregationJob(
    @Body() createAggregationJobDto: CreateAggregationJobDto,
  ) {
    return await this.aggregationService.aggregateDataManually(
      createAggregationJobDto,
    );
  }

  @Get()
  public async getAggregationJobs(
    @Query() getAggregationJobsDto: GetAggregationJobsDto,
  ) {
    return await this.aggregationService.getAggregationJobs(
      getAggregationJobsDto,
    );
  }

  @Get(':id')
  public async getAggregationJobById(
    @Param('id', ValidateMongoIdPipe) id: string,
  ): Promise<AggregationJob> {
    return await this.aggregationService.getAggregationJobById(id);
  }
}
