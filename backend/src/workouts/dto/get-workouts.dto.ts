import { IsDateString, IsOptional } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class GetWorkoutsDto {
  @ApiProperty({ example: '2024-01-01', required: false })
  @IsDateString()
  @IsOptional()
  from?: string;

  @ApiProperty({ example: '2024-01-31', required: false })
  @IsDateString()
  @IsOptional()
  to?: string;
}
