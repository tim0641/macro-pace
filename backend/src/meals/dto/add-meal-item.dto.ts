import { IsString, IsNumber, Min } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class AddMealItemDto {
  @ApiProperty({ example: 'food-uuid-here' })
  @IsString()
  foodId: string;

  @ApiProperty({ example: 150 })
  @IsNumber()
  @Min(0.01)
  grams: number;
}
