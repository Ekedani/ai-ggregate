import { ApiProperty } from '@nestjs/swagger';

export class GetImagesDto {
  @ApiProperty({ description: 'Page number', type: Number, minimum: 1 })
  page: number;

  @ApiProperty({
    description: 'Limit per page',
    type: Number,
    minimum: 20,
    maximum: 1000,
  })
  limit: number;

  @ApiProperty({
    description: 'Job ID',
    required: false,
    type: String,
    format: 'MongoID',
  })
  jobId?: string;

  @ApiProperty({ description: 'Provider name', required: false, type: String })
  providerName?: string;

  @ApiProperty({
    description: 'Whether the provider is trusted',
    required: false,
    type: Boolean,
  })
  providerIsTrusted?: boolean;

  @ApiProperty({ description: 'Prompt', required: false, type: String })
  prompt?: string;

  @ApiProperty({
    description: 'Negative prompt',
    required: false,
    type: String,
  })
  negativePrompt?: string;

  @ApiProperty({ description: 'Model', required: false, type: String })
  model?: string;

  @ApiProperty({ description: 'Content tags', required: false, type: [String] })
  contentTags?: string[];

  @ApiProperty({
    description: 'Technical tags',
    required: false,
    type: [String],
  })
  technicalTags?: string[];

  @ApiProperty({
    description: 'Status',
    required: false,
    enum: ['approved', 'rejected', 'pending'],
  })
  status?: string;
}
