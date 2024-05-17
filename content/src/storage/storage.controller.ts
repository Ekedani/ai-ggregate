import { Controller, Get, Param, Res } from '@nestjs/common';
import { StorageService } from './storage.service';
import { Response } from 'express';

@Controller('storage')
export class StorageController {
  constructor(private storageService: StorageService) {}

  @Get('images/:key')
  async findImage(@Param('key') key: string, @Res() res: Response) {
    const imageBuffer = await this.storageService.getObject(
      'genai-images',
      key,
    );
    const format = this.getImageFormat(key);
    res.setHeader('Content-Type', `image/${format}`);
    res.send(imageBuffer);
  }

  @Get('thumbnails/:key')
  async findThumbnail(@Param('key') key: string, @Res() res: Response) {
    const imageBuffer = await this.storageService.getObject(
      'genai-thumbnails',
      key,
    );
    const format = this.getImageFormat(key);
    res.setHeader('Content-Type', `image/${format}`);
    res.send(imageBuffer);
  }

  private getImageFormat(key: string): string {
    let format = key.split('.').pop().toLowerCase();
    if (format === 'jpg') {
      format = 'jpeg';
    }
    return format;
  }
}
