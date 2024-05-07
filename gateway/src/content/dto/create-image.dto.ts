import { ApiProperty } from '@nestjs/swagger';

export class CreateImageDto {
  @ApiProperty({
    description: 'Model used for generating images',
    required: true,
    example: 'Midjourney',
  })
  model: string;

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
    description: 'Technical tags associated with the images',
    required: false,
    type: [String],
    example: ['sampler: DPM++ 2M', 'cfg scale: 7'],
  })
  technicalTags?: string[];
}
