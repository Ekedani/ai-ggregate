import { IsArray, IsNotEmpty, IsOptional, IsString } from 'class-validator';

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
  @IsArray()
  @IsString({ each: true })
  technicalTags?: string[];
}
