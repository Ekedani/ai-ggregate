import { Module } from '@nestjs/common';
import { StorageService } from './storage.service';
import { MinioStorageService } from './services/minio-storage.service';
import { StorageController } from './storage.controller';

@Module({
  providers: [
    {
      provide: StorageService,
      useClass: MinioStorageService,
    },
  ],
  exports: [StorageService],
  controllers: [StorageController],
})
export class StorageModule {}
