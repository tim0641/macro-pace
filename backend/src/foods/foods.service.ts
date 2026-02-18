import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateFoodDto } from './dto/create-food.dto';
import { SearchFoodsDto } from './dto/search-foods.dto';

@Injectable()
export class FoodsService {
  constructor(private prisma: PrismaService) {}

  async search(searchDto: SearchFoodsDto) {
    const { query, limit = 20 } = searchDto;

    const where = query
      ? {
          OR: [
            { name: { contains: query, mode: 'insensitive' as const } },
            { brand: { contains: query, mode: 'insensitive' as const } },
          ],
        }
      : {};

    const foods = await this.prisma.food.findMany({
      where,
      // On récupère un peu plus pour permettre un tri "pertinence simple" côté JS
      take: query ? Math.min(limit * 5, 100) : limit,
      orderBy: [{ createdAt: 'desc' }],
    });

    if (!query) {
      return foods;
    }

    const q = query.trim().toLowerCase();

    const score = (name: string, brand: string | null) => {
      const n = name.toLowerCase();
      const b = (brand ?? '').toLowerCase();

      let s = 0;
      if (n.startsWith(q)) s += 100;
      else if (n.includes(q)) s += 60;

      if (b.startsWith(q)) s += 40;
      else if (b.includes(q)) s += 20;

      // Bonus léger pour les noms plus courts (souvent plus pertinents)
      s += Math.max(0, 20 - Math.min(20, n.length / 5));

      return s;
    };

    return foods
      .slice()
      .sort((a, b) => score(b.name, b.brand) - score(a.name, a.brand))
      .slice(0, limit);
  }

  async create(createDto: CreateFoodDto) {
    const food = await this.prisma.food.create({
      data: {
        name: createDto.name,
        brand: createDto.brand,
        kcal100g: createDto.kcal100g,
        protein100g: createDto.protein100g,
        carbs100g: createDto.carbs100g,
        fat100g: createDto.fat100g,
      },
    });

    return food;
  }
}
