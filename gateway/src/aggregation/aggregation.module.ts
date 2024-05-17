import { Module } from '@nestjs/common';
import { JobsController } from './controllers/jobs.controller';
import { ImagesController } from './controllers/images.controller';
import { HttpModule } from '@nestjs/axios';

@Module({
  controllers: [JobsController, ImagesController],
  providers: [],
  imports: [HttpModule],
})
export class AggregationModule {}
