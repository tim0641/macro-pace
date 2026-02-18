import { IsString, IsDateString, IsInt, IsOptional, Min, Max, IsNumber, ValidateIf } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreateWorkoutDto {
  @ApiProperty({ example: '2024-01-15T08:00:00Z' })
  @IsDateString()
  startedAt: string;

  @ApiProperty({ example: 'run', enum: ['run', 'strength'] })
  @IsString()
  type: 'run' | 'strength';

  @ApiProperty({ example: 45 })
  @IsInt()
  @Min(1)
  durationMin: number;

  @ApiProperty({ example: 7, required: false, minimum: 1, maximum: 10 })
  @IsInt()
  @Min(1)
  @Max(10)
  @IsOptional()
  rpe?: number;

  @ApiProperty({ example: 'Entraînement matinal', required: false })
  @IsString()
  @IsOptional()
  notes?: string;

  // Champs spécifiques pour les runs
  @ApiProperty({ example: 5.5, required: false })
  @ValidateIf((o) => o.type === 'run')
  @IsNumber()
  @Min(0)
  distanceKm?: number;

  @ApiProperty({ example: 300, required: false, description: 'Secondes par km' })
  @ValidateIf((o) => o.type === 'run')
  @IsNumber()
  @Min(0)
  avgPaceSecKm?: number;
}
