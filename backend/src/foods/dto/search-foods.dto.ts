import { IsString, IsOptional, IsInt, Min, Max } from 'class-validator';
import { Type } from 'class-transformer';
import { ApiProperty } from '@nestjs/swagger';

export class SearchFoodsDto {
  @ApiProperty({ example: 'poulet', required: false })
  @IsString()
  @IsOptional()
  query?: string;

  @ApiProperty({ example: 20, default: 20, required: false })
  @Type(() => Number)
  @IsInt()
  @Min(1)
  @Max(100)
  @IsOptional()
  limit?: number = 20;
}
