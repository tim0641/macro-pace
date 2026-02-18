import { Controller, Get, Query, UseGuards, Request } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth } from '@nestjs/swagger';
import { StatsService } from './stats.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';

@ApiTags('stats')
@Controller('stats')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth()
export class StatsController {
  constructor(private readonly statsService: StatsService) {}

  @Get('day')
  @ApiOperation({ summary: 'Obtenir les statistiques d\'une journée (avec cibles si profil complet)' })
  @ApiResponse({ status: 200, description: 'Statistiques journalières' })
  async getDayStats(@Request() req, @Query('date') date: string) {
    const targetDate = date || new Date().toISOString().split('T')[0];
    return this.statsService.getDayStats(req.user.userId, targetDate);
  }

  @Get('week')
  @ApiOperation({ summary: 'Statistiques sur les 7 derniers jours (pour graphiques)' })
  @ApiResponse({ status: 200, description: 'Tableau de 7 jours' })
  async getWeekStats(@Request() req, @Query('date') date: string) {
    return this.statsService.getWeekStats(req.user.userId, date);
  }
}
