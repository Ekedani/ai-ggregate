import { Module } from '@nestjs/common';
import { ImagesController } from './controllers/images.controller';
import { StorageController } from './controllers/storage.controller';

@Module({
  controllers: [ImagesController, StorageController],
})
export class ContentModule {}
