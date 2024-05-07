import {
  IsArray,
  IsBoolean,
  IsIn,
  IsInt,
  IsMongoId,
  IsOptional,
  IsString,
  Max,
  Min,
} from 'class-validator';
import { Type } from 'class-transformer';

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
  @IsMongoId()
  @IsString()
  jobId?: string;

  @IsOptional()
  @IsString()
  providerName?: string;

  @IsOptional()
  @Type(() => Boolean)
  @IsBoolean()
  providerIsTrusted?: boolean;

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
  @IsArray()
  @IsString({ each: true })
  contentTags?: string[];

  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  technicalTags?: string[];

  @IsOptional()
  @IsString()
  @IsIn(['approved', 'rejected', 'pending'])
  status?: string;
}
