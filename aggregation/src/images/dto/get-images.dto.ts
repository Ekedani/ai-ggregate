import {
  IsArray,
  IsBoolean,
  IsIn,
  IsInt,
  IsMongoId,
  IsNotEmpty,
  IsOptional,
  IsString,
  Max,
  Min,
} from 'class-validator';
import { Transform, Type } from 'class-transformer';

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
  @Transform(({ value }) => (Array.isArray(value) ? value : [value]), {
    toClassOnly: true,
  })
  @IsArray()
  @IsString({ each: true })
  @IsNotEmpty({ each: true })
  contentTags?: string[];

  @IsOptional()
  @Transform(({ value }) => (Array.isArray(value) ? value : [value]), {
    toClassOnly: true,
  })
  @IsArray()
  @IsString({ each: true })
  @IsNotEmpty({ each: true })
  technicalTags?: string[];

  @IsOptional()
  @IsString()
  @IsIn(['approved', 'rejected', 'pending'])
  status?: string;
}
