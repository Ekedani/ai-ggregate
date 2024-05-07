import { IsIn, IsInt, IsOptional, Max, Min } from 'class-validator';
import { Type } from 'class-transformer';

export class GetAggregationJobsDto {
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
  @IsIn(['running', 'success', 'failed'])
  status: string;
}
