import { ArrayMinSize, IsArray, IsIn, IsOptional } from 'class-validator';

export class CreateAggregationJobDto {
  @IsOptional()
  @IsArray()
  @ArrayMinSize(1)
  @IsIn(['midjourney', 'lexica', 'prompthero', 'civitai'], { each: true })
  imageProviders: string[];
}
