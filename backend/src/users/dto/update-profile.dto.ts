import { IsEnum, IsNumber, IsOptional, IsDateString, Min, Max } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export enum SexDto {
  male = 'male',
  female = 'female',
}

export enum ActivityLevelDto {
  sedentary = 'sedentary',
  light = 'light',
  moderate = 'moderate',
  very = 'very',
  athlete = 'athlete',
}

export enum GoalDto {
  maintain = 'maintain',
  lose = 'lose',
  gain = 'gain',
}

export enum GoalRateDto {
  slow = 'slow',
  medium = 'medium',
  fast = 'fast',
}

export class UpdateProfileDto {
  @ApiProperty({ enum: SexDto, required: false })
  @IsEnum(SexDto)
  @IsOptional()
  sex?: SexDto;

  @ApiProperty({ example: '1990-05-15', required: false })
  @IsDateString()
  @IsOptional()
  birthdate?: string;

  @ApiProperty({ example: 175, minimum: 100, maximum: 250, required: false })
  @IsNumber()
  @Min(100)
  @Max(250)
  @IsOptional()
  heightCm?: number;

  @ApiProperty({ example: 70, minimum: 30, maximum: 300, required: false })
  @IsNumber()
  @Min(30)
  @Max(300)
  @IsOptional()
  weightKg?: number;

  @ApiProperty({ enum: ActivityLevelDto, required: false })
  @IsEnum(ActivityLevelDto)
  @IsOptional()
  activityLevel?: ActivityLevelDto;

  @ApiProperty({ enum: GoalDto, required: false })
  @IsEnum(GoalDto)
  @IsOptional()
  goal?: GoalDto;

  @ApiProperty({ enum: GoalRateDto, required: false })
  @IsEnum(GoalRateDto)
  @IsOptional()
  goalRate?: GoalRateDto;
}
