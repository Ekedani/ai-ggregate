import { ApiProperty } from '@nestjs/swagger';

export class GetImagesDto {
  @ApiProperty({
    description: 'Page number of the results',
    minimum: 1,
    example: 1,
  })
  page: number;

  @ApiProperty({
    description: 'Number of results per page',
    minimum: 20,
    maximum: 1000,
    example: 50,
  })
  limit: number;

  @ApiProperty({
    description: 'Prompt used to generate images',
    required: false,
    example: 'a human',
  })
  prompt?: string;

  @ApiProperty({
    description: 'Prompt used to limit generation results',
    required: false,
    example: 'bad anatomy',
  })
  negativePrompt?: string;

  @ApiProperty({
    description: 'Model used for generating images',
    required: false,
    example: 'Midjourney',
  })
  model?: string;

  @ApiProperty({
    description: 'Date images were created before',
    required: false,
    example: '2024-05-03T00:00:00Z',
  })
  createdBefore?: Date;

  @ApiProperty({
    description: 'Date images were created after',
    required: false,
    example: '2024-05-03T00:00:00Z',
  })
  createdAfter?: Date;

  @ApiProperty({
    description: 'Provider of the images',
    required: false,
    example: 'midjourney',
  })
  provider?: string;

  @ApiProperty({
    description: 'Format of the images',
    required: false,
    enum: ['jpeg', 'png', 'webp', 'jpg'],
  })
  format?: string;

  @ApiProperty({
    description: 'Content tags associated with the images',
    required: false,
    type: [String],
    example: ['man', 'nature'],
  })
  contentTags?: string[];

  @ApiProperty({
    description: 'Technical tags associated with the images',
    required: false,
    type: [String],
    example: ['sampler: DPM++ 2M', 'cfg scale: 7'],
  })
  technicalTags?: string[];
}
