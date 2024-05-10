import { IsArray, IsNotEmpty, IsOptional, IsString } from 'class-validator';
import { Transform } from 'class-transformer';

export class CreateImageDto {
  @IsString()
  @IsNotEmpty()
  model: string;

  @IsOptional()
  @IsString()
  @IsNotEmpty()
  prompt?: string;

  @IsOptional()
  @IsString()
  @IsNotEmpty()
  negativePrompt?: string;

  @IsOptional()
  @Transform(({ value }) => (Array.isArray(value) ? value : [value]), {
    toClassOnly: true,
  })
  @IsArray()
  @IsString({ each: true })
  technicalTags?: string[];
}
