import { IsEnum, IsNumber, IsOptional, IsString, Min } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export enum FoodSourceDto {
  usda = 'usda',
  custom = 'custom',
}

export class AddMealItemDto {
  @ApiProperty({ example: 'usda', enum: FoodSourceDto })
  @IsEnum(FoodSourceDto)
  foodSource: FoodSourceDto;

  @ApiProperty({ example: '2345678', required: false, description: 'Identifiant externe (ex: fdcId USDA)' })
  @IsString()
  @IsOptional()
  externalFoodId?: string;

  @ApiProperty({ example: 'Poulet grillé' })
  @IsString()
  foodName: string;

  @ApiProperty({ example: 'Marque X', required: false })
  @IsString()
  @IsOptional()
  foodBrand?: string;

  @ApiProperty({ example: 165, description: 'Kcal pour 100g' })
  @IsNumber()
  @Min(0)
  kcal100g: number;

  @ApiProperty({ example: 31, description: 'Protéines (g) pour 100g' })
  @IsNumber()
  @Min(0)
  protein100g: number;

  @ApiProperty({ example: 0, description: 'Glucides (g) pour 100g' })
  @IsNumber()
  @Min(0)
  carbs100g: number;

  @ApiProperty({ example: 3.6, description: 'Lipides (g) pour 100g' })
  @IsNumber()
  @Min(0)
  fat100g: number;

  @ApiProperty({ example: 150 })
  @IsNumber()
  @Min(0.01)
  grams: number;
}
