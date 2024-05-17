import { ApiProperty } from '@nestjs/swagger';

export class BulkImageModerationDto {
  @ApiProperty({
    description: 'Array of image IDs',
    type: [String],
    minItems: 1,
    maxItems: 100,
    format: 'MongoID',
  })
  imageIds: string[];
}
