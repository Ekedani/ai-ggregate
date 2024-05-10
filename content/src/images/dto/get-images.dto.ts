import { Transform, Type } from 'class-transformer';
import {
  IsArray,
  IsDate,
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
  @Type(() => Date)
  @IsDate()
  createdBefore?: Date;

  @IsOptional()
  @Type(() => Date)
  @IsDate()
  createdAfter?: Date;

  @IsOptional()
  @IsString()
  provider?: string;

  @IsOptional()
  @IsString()
  @IsIn(['jpeg', 'png', 'webp', 'jpg'])
  format?: string;

  @IsOptional()
  @Transform(({ value }) => (Array.isArray(value) ? value : [value]), {
    toClassOnly: true,
  })
  @IsArray()
  @IsString({ each: true })
  contentTags?: string[];

  @IsOptional()
  @Transform(({ value }) => (Array.isArray(value) ? value : [value]), {
    toClassOnly: true,
  })
  @IsArray()
  @IsString({ each: true })
  technicalTags?: string[];
}
