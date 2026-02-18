import { Injectable, NotFoundException, ForbiddenException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateMealDto } from './dto/create-meal.dto';
import { AddMealItemDto } from './dto/add-meal-item.dto';

@Injectable()
export class MealsService {
  constructor(private prisma: PrismaService) {}

  async create(userId: string, createDto: CreateMealDto) {
    const meal = await this.prisma.meal.create({
      data: {
        userId,
        eatenAt: new Date(createDto.eatenAt),
        mealType: createDto.mealType,
        note: createDto.note,
      },
    });

    return meal;
  }

  async addItem(userId: string, mealId: string, addItemDto: AddMealItemDto) {
    // Vérifier que le meal appartient à l'utilisateur
    const meal = await this.prisma.meal.findUnique({
      where: { id: mealId },
    });

    if (!meal) {
      throw new NotFoundException('Repas non trouvé');
    }

    if (meal.userId !== userId) {
      throw new ForbiddenException('Vous n\'avez pas accès à ce repas');
    }

    // Récupérer l'aliment
    const food = await this.prisma.food.findUnique({
      where: { id: addItemDto.foodId },
    });

    if (!food) {
      throw new NotFoundException('Aliment non trouvé');
    }

    // Calculer les macros pour la quantité donnée
    const ratio = addItemDto.grams / 100;
    const kcal = Number(food.kcal100g) * ratio;
    const protein = Number(food.protein100g) * ratio;
    const carbs = Number(food.carbs100g) * ratio;
    const fat = Number(food.fat100g) * ratio;

    // Créer l'item avec snapshot des macros
    const mealItem = await this.prisma.mealItem.create({
      data: {
        mealId,
        foodId: addItemDto.foodId,
        grams: addItemDto.grams,
        kcal,
        protein,
        carbs,
        fat,
      },
      include: {
        food: true,
      },
    });

    return mealItem;
  }

  async findByDate(userId: string, date: string) {
    const startOfDay = new Date(date);
    startOfDay.setHours(0, 0, 0, 0);
    const endOfDay = new Date(date);
    endOfDay.setHours(23, 59, 59, 999);

    const meals = await this.prisma.meal.findMany({
      where: {
        userId,
        eatenAt: {
          gte: startOfDay,
          lte: endOfDay,
        },
      },
      include: {
        items: {
          include: {
            food: true,
          },
        },
      },
      orderBy: {
        eatenAt: 'asc',
      },
    });

    // Calculer les totaux journaliers
    const totals = meals.reduce(
      (acc, meal) => {
        meal.items.forEach((item) => {
          acc.kcal += Number(item.kcal);
          acc.protein += Number(item.protein);
          acc.carbs += Number(item.carbs);
          acc.fat += Number(item.fat);
        });
        return acc;
      },
      { kcal: 0, protein: 0, carbs: 0, fat: 0 },
    );

    return {
      meals,
      totals,
    };
  }
}
