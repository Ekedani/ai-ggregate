import { ApiProperty } from '@nestjs/swagger';

export class GetAggregationJobsDto {
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
    description: 'Status of the job',
    required: false,
    enum: ['running', 'success', 'failed'],
  })
  status?: string;
}
