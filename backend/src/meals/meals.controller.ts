import { Controller, Get, Post, Delete, Body, Param, Query, UseGuards, Request } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth, ApiParam } from '@nestjs/swagger';
import { MealsService } from './meals.service';
import { CreateMealDto } from './dto/create-meal.dto';
import { AddMealItemDto } from './dto/add-meal-item.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';

@ApiTags('meals')
@Controller('meals')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth()
export class MealsController {
  constructor(private readonly mealsService: MealsService) {}

  @Post()
  @ApiOperation({ summary: 'Créer un repas' })
  @ApiResponse({ status: 201, description: 'Repas créé avec succès' })
  async create(@Request() req, @Body() createDto: CreateMealDto) {
    return this.mealsService.create(req.user.userId, createDto);
  }

  @Post('quick-add')
  @ApiOperation({ summary: 'Ajouter rapidement un aliment (crée un repas snack du jour)' })
  @ApiResponse({ status: 201, description: 'Repas créé avec l\'aliment ajouté' })
  async quickAdd(@Request() req, @Body() body: AddMealItemDto & { mealType?: string; eatenAt?: string }) {
    return this.mealsService.quickAdd(req.user.userId, body);
  }

  @Post(':id/items')
  @ApiOperation({ summary: 'Ajouter un aliment à un repas' })
  @ApiParam({ name: 'id', description: 'ID du repas' })
  @ApiResponse({ status: 201, description: 'Aliment ajouté au repas' })
  async addItem(@Request() req, @Param('id') mealId: string, @Body() addItemDto: AddMealItemDto) {
    return this.mealsService.addItem(req.user.userId, mealId, addItemDto);
  }

  @Get()
  @ApiOperation({ summary: 'Obtenir les repas d\'une date' })
  @ApiResponse({ status: 200, description: 'Liste des repas avec totaux' })
  async findByDate(@Request() req, @Query('date') date: string) {
    const targetDate = date || new Date().toISOString().split('T')[0];
    return this.mealsService.findByDate(req.user.userId, targetDate);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Supprimer un repas' })
  @ApiParam({ name: 'id', description: 'ID du repas' })
  @ApiResponse({ status: 200, description: 'Repas supprimé' })
  async delete(@Request() req, @Param('id') mealId: string) {
    return this.mealsService.delete(req.user.userId, mealId);
  }
}
