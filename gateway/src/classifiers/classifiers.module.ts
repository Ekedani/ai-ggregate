import { Module } from '@nestjs/common';
import { ImagesController } from './controllers/images.controller';

@Module({
  controllers: [ImagesController],
  providers: [],
})
export class ClassifiersModule {}
