import { ConflictException, Injectable, Logger } from '@nestjs/common';
import { Cron } from '@nestjs/schedule';
import { Model, PipelineStage } from 'mongoose';
import { InjectModel } from '@nestjs/mongoose';
import { AggregationJob } from './schemas/aggregation-job.schema';
import { DataSourceDetail } from './schemas/data-source-detail.schema';
import { ImageCollectorService } from './collectors/image-collector.service';
import { CreateAggregationJobDto } from './dto/create-aggregation-job.dto';
import { GetAggregationJobsDto } from './dto/get-aggregation-jobs.dto';

@Injectable()
export class AggregationService {
  private logger = new Logger('AggregationService');

  constructor(
    @InjectModel(AggregationJob.name)
    private readonly aggregationJobModel: Model<AggregationJob>,
    private readonly imageCollectionService: ImageCollectorService,
  ) {}

  public async aggregateDataManually(
    createAggregationJobDto: CreateAggregationJobDto,
  ): Promise<AggregationJob> {
    return this.startAggregationJob('manual', createAggregationJobDto);
  }

  @Cron('0 0 0 * * *')
  public async aggregateDataBySchedule(): Promise<void> {
    try {
      await this.startAggregationJob('scheduled');
    } catch (error) {
      this.logger.error('Scheduled aggregation rejected: ' + error.message);
    }
  }

  public async getAggregationJobs(
    getAggregationJobsDto: GetAggregationJobsDto,
  ) {
    const { page, limit } = getAggregationJobsDto;
    const matchStage = this.buildMatchStage(getAggregationJobsDto);
    const results = await this.getMatchedAggregationJobs(
      matchStage,
      page,
      limit,
    );
    return this.addPaginationData(results, page);
  }

  public async getAggregationJobById(id: string) {
    return this.aggregationJobModel.findById(id);
  }

  private async startAggregationJob(
    type: string,
    createAggregationJobDto?: CreateAggregationJobDto,
  ): Promise<AggregationJob> {
    const isJobRunning = await this.checkIfAnyAggregationJobIsRunning();
    if (isJobRunning) {
      throw new ConflictException('Another aggregation job is already running');
    }

    const imageProviders = createAggregationJobDto?.imageProviders || [];
    const job = await this.createAggregationJob(type, imageProviders);

    this.collectAiGeneratedData(job).catch((error) => {
      this.logger.error('Error in background aggregation: ' + error.message);
    });
    return job;
  }

  private async collectAiGeneratedData(job: AggregationJob) {
    this.logger.log(`Started ${job.type} aggregation job #${job._id}`);

    const dataSourceDetails =
      await this.imageCollectionService.collectAiGeneratedImages(job);

    await this.finishAggregationJob(job, dataSourceDetails);
    this.logger.log(`Finished ${job.type} aggregation job #${job._id}`);
  }

  private async createAggregationJob(
    type: string,
    imageProviders: string[],
  ): Promise<AggregationJob> {
    const jobReport = new this.aggregationJobModel({
      type,
      status: 'running',
      startedAt: new Date(),
    });

    if (imageProviders.length > 0) {
      jobReport.dataSourceDetails = imageProviders.map((provider) => ({
        contentType: 'image',
        provider: provider,
        fetched: 0,
        inserted: 0,
        status: 'running',
      }));
    }

    return jobReport.save();
  }

  private async checkIfAnyAggregationJobIsRunning(): Promise<boolean> {
    const runningJobs = await this.aggregationJobModel.find({
      status: 'running',
    });
    return runningJobs.length > 0;
  }

  private async finishAggregationJob(
    job: AggregationJob,
    dataSourceDetails: DataSourceDetail[],
  ): Promise<void> {
    job.status = 'finished';
    job.finishedAt = new Date();
    job.dataSourceDetails = dataSourceDetails;
    await job.save();
  }

  private buildMatchStage(getAggregationJobsDto: GetAggregationJobsDto) {
    const { status } = getAggregationJobsDto;

    const matchStage = {};

    if (status) matchStage['status'] = status;

    return matchStage;
  }

  private getMatchedAggregationJobs(
    matchStage: any,
    page: number,
    limit: number,
  ) {
    const pipeline: PipelineStage[] = [
      { $match: matchStage },
      {
        $facet: {
          metadata: [{ $count: 'total' }],
          data: [
            { $sort: { startedAt: -1 } },
            { $skip: (page - 1) * limit },
            { $limit: limit },
          ],
        },
      },
    ];
    return this.aggregationJobModel.aggregate(pipeline);
  }

  private addPaginationData(result: any[], page: number) {
    return {
      total: result[0].metadata[0]?.total || 0,
      page,
      jobs: result[0].data,
    };
  }
}
