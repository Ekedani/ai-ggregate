import { Module } from '@nestjs/common';
import { PostprocessingService } from './postprocessing.service';
import { HttpModule } from '@nestjs/axios';

@Module({
  providers: [PostprocessingService],
  imports: [HttpModule],
  exports: [PostprocessingService],
})
export class PostprocessingModule {}
