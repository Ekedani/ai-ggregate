import { Injectable, NotFoundException } from '@nestjs/common';
import { StorageService } from '../storage.service';
import { Client } from 'minio';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class MinioStorageService extends StorageService {
  private readonly minioClient: Client;

  constructor(configService: ConfigService) {
    super();
    this.minioClient = new Client({
      endPoint: configService.get('MINIO_ENDPOINT'),
      port: parseInt(configService.get('MINIO_PORT')),
      useSSL: false,
      accessKey: configService.get('MINIO_ACCESS_KEY'),
      secretKey: configService.get('MINIO_SECRET_KEY'),
    });
  }

  async deleteObject(bucketName: string, objectName: string): Promise<void> {
    await this.minioClient.removeObject(bucketName, objectName);
  }

  async getObject(bucketName: string, objectName: string): Promise<Buffer> {
    try {
      const objectStream = await this.minioClient.getObject(
        bucketName,
        objectName,
      );

      const chunks: Buffer[] = [];
      objectStream.on('data', (chunk) => chunks.push(chunk));

      return new Promise((resolve, reject) => {
        objectStream.on('end', () => {
          resolve(Buffer.concat(chunks));
        });

        objectStream.on('error', reject);
      });
    } catch (error) {
      if (error.message.includes('The specified key does not exist')) {
        throw new NotFoundException();
      } else {
        throw error;
      }
    }
  }

  async uploadObject(
    bucketName: string,
    objectName: string,
    buffer: Buffer,
  ): Promise<void> {
    await this.minioClient.putObject(bucketName, objectName, buffer);
  }
}
