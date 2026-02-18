import { IsString, IsNumber, IsOptional, Min } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreateFoodDto {
  @ApiProperty({ example: 'Poulet grillé' })
  @IsString()
  name: string;

  @ApiProperty({ example: 'Marque X', required: false })
  @IsString()
  @IsOptional()
  brand?: string;

  @ApiProperty({ example: 165 })
  @IsNumber()
  @Min(0)
  kcal100g: number;

  @ApiProperty({ example: 31 })
  @IsNumber()
  @Min(0)
  protein100g: number;

  @ApiProperty({ example: 0 })
  @IsNumber()
  @Min(0)
  carbs100g: number;

  @ApiProperty({ example: 3.6 })
  @IsNumber()
  @Min(0)
  fat100g: number;
}
