import { ApiProperty } from '@nestjs/swagger';

export class CreateAggregationJobDto {
  @ApiProperty({
    description: 'Image providers',
    required: false,
    type: [String],
    enum: ['midjourney', 'lexica', 'prompthero', 'civitai'],
  })
  imageProviders?: string[];
}
