import { Module } from '@nestjs/common';
import { ImageFetcherFactoryService } from './factories/image-fetcher-factory.service';
import { HttpModule } from '@nestjs/axios';

@Module({
  providers: [ImageFetcherFactoryService],
  exports: [ImageFetcherFactoryService],
  imports: [HttpModule],
})
export class DataFetchersModule {}
