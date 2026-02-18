import { Controller, Get, Post, Body, Query, UseGuards, Request } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth } from '@nestjs/swagger';
import { WorkoutsService } from './workouts.service';
import { CreateWorkoutDto } from './dto/create-workout.dto';
import { GetWorkoutsDto } from './dto/get-workouts.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';

@ApiTags('workouts')
@Controller('workouts')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth()
export class WorkoutsController {
  constructor(private readonly workoutsService: WorkoutsService) {}

  @Post()
  @ApiOperation({ summary: 'Créer un entraînement' })
  @ApiResponse({ status: 201, description: 'Entraînement créé avec succès' })
  async create(@Request() req, @Body() createDto: CreateWorkoutDto) {
    return this.workoutsService.create(req.user.userId, createDto);
  }

  @Get()
  @ApiOperation({ summary: 'Obtenir les entraînements dans une période' })
  @ApiResponse({ status: 200, description: 'Liste des entraînements' })
  async findByDateRange(@Request() req, @Query() getDto: GetWorkoutsDto) {
    return this.workoutsService.findByDateRange(req.user.userId, getDto);
  }
}
