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

  /**
   * Manually starts an aggregation job with the given details.
   * @param createAggregationJobDto - The details of the aggregation job to create.
   * @returns The created aggregation job.
   */
  public async aggregateDataManually(
    createAggregationJobDto: CreateAggregationJobDto,
  ): Promise<AggregationJob> {
    return this.startAggregationJob('manual', createAggregationJobDto);
  }

  /**
   * Starts a default aggregation job according to a schedule.
   */
  @Cron('0 0 0 * * *')
  public async aggregateDataBySchedule(): Promise<void> {
    try {
      await this.startAggregationJob('scheduled');
    } catch (error) {
      this.logger.error('Scheduled aggregation rejected: ' + error.message);
    }
  }

  /**
   * Retrieves a list of aggregation jobs based on the given filter and pagination details.
   * @param getAggregationJobsDto - The filter and pagination details.
   * @returns A paginated list of aggregation jobs.
   */
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

  /**
   * Retrieves a specific aggregation job by its ID.
   * @param id - The ID of the aggregation job to retrieve.
   * @returns The aggregation job with the given ID.
   */
  public async getAggregationJobById(id: string) {
    return this.aggregationJobModel.findById(id);
  }

  /**
   * Starts an aggregation job of the given type with optional details.
   * @param type - The type of the aggregation job (manual or scheduled).
   * @param createAggregationJobDto - Optional details of the aggregation job to create.
   * @returns The created aggregation job.
   */
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

  /**
   * Collects AI-generated data for the given aggregation job.
   * @param job - The aggregation job for which to collect data.
   */
  private async collectAiGeneratedData(job: AggregationJob) {
    this.logger.log(`Started ${job.type} aggregation job #${job._id}`);

    const dataSourceDetails =
      await this.imageCollectionService.collectAiGeneratedImages(job);

    await this.finishAggregationJob(job, dataSourceDetails);
    this.logger.log(`Finished ${job.type} aggregation job #${job._id}`);
  }

  /**
   * Creates a new aggregation job.
   * @param type - The type of the aggregation job (manual or scheduled).
   * @param imageProviders - The list of image providers to use for the job.
   * @returns The created aggregation job.
   */
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

  /**
   * Checks if any aggregation job is currently running.
   * @returns A boolean indicating whether any aggregation job is running.
   */
  private async checkIfAnyAggregationJobIsRunning(): Promise<boolean> {
    const runningJobs = await this.aggregationJobModel.find({
      status: 'running',
    });
    return runningJobs.length > 0;
  }

  /**
   * Finishes the given aggregation job by updating its status and details.
   * @param job - The aggregation job to finish.
   * @param dataSourceDetails - The details of the data sources used in the job.
   */
  private async finishAggregationJob(
    job: AggregationJob,
    dataSourceDetails: DataSourceDetail[],
  ): Promise<void> {
    job.status = 'finished';
    job.finishedAt = new Date();
    job.dataSourceDetails = dataSourceDetails;
    await job.save();
  }

  /**
   * Builds a match stage for MongoDB aggregation based on the given filter details.
   * @param getAggregationJobsDto - The filter details.
   * @returns The match stage object for MongoDB aggregation.
   */
  private buildMatchStage(getAggregationJobsDto: GetAggregationJobsDto) {
    const { status } = getAggregationJobsDto;

    const matchStage = {};

    if (status) matchStage['status'] = status;

    return matchStage;
  }

  /**
   * Retrieves matched aggregation jobs from the database based on the match stage and pagination info.
   * @param matchStage - The match stage object for MongoDB aggregation.
   * @param page - The current page number for pagination.
   * @param limit - The number of items per page for pagination.
   * @returns The aggregation result containing metadata and job data.
   */
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

  /**
   * Adds pagination data to the result aggregation jobs set.
   * @param result - The aggregation result containing metadata and job data.
   * @param page - The current page number for pagination.
   * @returns An object containing total count, current page, and job data.
   */
  private addPaginationData(result: any[], page: number) {
    return {
      total: result[0].metadata[0]?.total || 0,
      page,
      jobs: result[0].data,
    };
  }
}
