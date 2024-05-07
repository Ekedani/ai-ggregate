import { Module } from '@nestjs/common';
import { ClassifiersService } from './classifiers.service';
import { HttpModule } from '@nestjs/axios';

@Module({
  providers: [ClassifiersService],
  imports: [HttpModule],
  exports: [ClassifiersService],
})
export class ClassifiersModule {}
