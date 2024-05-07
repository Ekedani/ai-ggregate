import {
  ArrayMaxSize,
  ArrayMinSize,
  IsArray,
  IsDate,
  IsMongoId,
  IsNotEmpty,
  IsOptional,
  IsString,
  ValidateNested,
} from 'class-validator';
import { Type } from 'class-transformer';

export class AggregatedImageDto {
  @IsString()
  @IsNotEmpty()
  @IsMongoId()
  stagingId: string;

  @IsString()
  @IsNotEmpty()
  provider: string;

  @IsString()
  originalImageUrl: string;

  @IsOptional()
  @IsString()
  originalId?: string;

  @IsOptional()
  @IsString()
  prompt?: string;

  @IsOptional()
  @IsString()
  negativePrompt?: string;

  @IsOptional()
  @IsString()
  model?: string;

  @IsOptional()
  @IsString()
  author?: string;

  @IsOptional()
  @Type(() => Date)
  @IsDate()
  createdAt?: Date;

  @IsOptional()
  @IsString()
  publicationUrl?: string;

  @IsString()
  @IsNotEmpty()
  format: string;

  @IsOptional()
  @IsArray()
  contentTags?: string[];

  @IsOptional()
  @IsArray()
  technicalTags?: string[];
}

export class ProcessAggregatedImagesDto {
  @IsArray()
  @ArrayMinSize(1)
  @ArrayMaxSize(100)
  @ValidateNested({ each: true })
  @Type(() => AggregatedImageDto)
  aggregatedImages: AggregatedImageDto[];
}
