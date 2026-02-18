import { Controller, Get, Query, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth } from '@nestjs/swagger';
import { FoodsService } from './foods.service';
import { SearchFoodsDto } from './dto/search-foods.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';

@ApiTags('foods')
@Controller('foods')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth()
export class FoodsController {
  constructor(private readonly foodsService: FoodsService) {}

  @Get()
  @ApiOperation({ summary: 'Rechercher des aliments' })
  @ApiResponse({ status: 200, description: 'Liste des aliments' })
  async search(@Query() searchDto: SearchFoodsDto) {
    return this.foodsService.search(searchDto);
  }
}
