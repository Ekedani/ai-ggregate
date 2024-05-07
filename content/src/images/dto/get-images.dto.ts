import { Type } from 'class-transformer';
import {
  IsArray,
  IsDateString,
  IsIn,
  IsInt,
  IsOptional,
  IsString,
  Max,
  Min,
} from 'class-validator';

export class GetImagesDto {
  @Type(() => Number)
  @IsInt()
  @Min(1)
  page: number;

  @Type(() => Number)
  @IsInt()
  @Min(20)
  @Max(1000)
  limit: number;

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
  @IsDateString()
  @Type(() => Date)
  createdBefore?: Date;

  @IsOptional()
  @IsDateString()
  @Type(() => Date)
  createdAfter?: Date;

  @IsOptional()
  @IsString()
  provider?: string;

  @IsOptional()
  @IsString()
  @IsIn(['jpeg', 'png', 'webp', 'jpg'])
  format?: string;

  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  contentTags?: string[];

  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  technicalTags?: string[];
}
