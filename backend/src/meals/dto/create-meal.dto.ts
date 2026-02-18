import { IsString, IsDateString, IsOptional } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreateMealDto {
  @ApiProperty({ example: '2024-01-15T12:30:00Z' })
  @IsDateString()
  eatenAt: string;

  @ApiProperty({ example: 'lunch', enum: ['breakfast', 'lunch', 'dinner', 'snack'] })
  @IsString()
  mealType: string;

  @ApiProperty({ example: 'Repas après entraînement', required: false })
  @IsString()
  @IsOptional()
  note?: string;
}
