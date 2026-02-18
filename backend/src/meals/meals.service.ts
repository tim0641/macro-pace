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

    // Calculer les macros pour la quantité donnée
    const ratio = addItemDto.grams / 100;
    const kcal = Number(addItemDto.kcal100g) * ratio;
    const protein = Number(addItemDto.protein100g) * ratio;
    const carbs = Number(addItemDto.carbs100g) * ratio;
    const fat = Number(addItemDto.fat100g) * ratio;

    // Créer l'item avec snapshot des macros
    const mealItem = await this.prisma.mealItem.create({
      data: {
        mealId,
        foodSource: addItemDto.foodSource,
        externalFoodId: addItemDto.externalFoodId,
        foodName: addItemDto.foodName,
        foodBrand: addItemDto.foodBrand,
        kcal100g: addItemDto.kcal100g,
        protein100g: addItemDto.protein100g,
        carbs100g: addItemDto.carbs100g,
        fat100g: addItemDto.fat100g,
        grams: addItemDto.grams,
        kcal,
        protein,
        carbs,
        fat,
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
        items: true,
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

  async delete(userId: string, mealId: string) {
    const meal = await this.prisma.meal.findUnique({
      where: { id: mealId },
    });

    if (!meal) {
      throw new NotFoundException('Repas non trouvé');
    }

    if (meal.userId !== userId) {
      throw new ForbiddenException('Vous n\'avez pas accès à ce repas');
    }

    await this.prisma.meal.delete({
      where: { id: mealId },
    });

    return { success: true, id: mealId };
  }

  async quickAdd(
    userId: string,
    dto: AddMealItemDto & { mealType?: string; eatenAt?: string },
  ) {
    const eatenAt = dto.eatenAt ? new Date(dto.eatenAt) : new Date();
    const mealType = dto.mealType || 'snack';

    const meal = await this.prisma.meal.create({
      data: {
        userId,
        eatenAt,
        mealType,
      },
    });

    const ratio = dto.grams / 100;
    const kcal = Number(dto.kcal100g) * ratio;
    const protein = Number(dto.protein100g) * ratio;
    const carbs = Number(dto.carbs100g) * ratio;
    const fat = Number(dto.fat100g) * ratio;

    await this.prisma.mealItem.create({
      data: {
        mealId: meal.id,
        foodSource: dto.foodSource,
        externalFoodId: dto.externalFoodId,
        foodName: dto.foodName,
        foodBrand: dto.foodBrand,
        kcal100g: dto.kcal100g,
        protein100g: dto.protein100g,
        carbs100g: dto.carbs100g,
        fat100g: dto.fat100g,
        grams: dto.grams,
        kcal,
        protein,
        carbs,
        fat,
      },
    });

    return this.prisma.meal.findUnique({
      where: { id: meal.id },
      include: { items: true },
    });
  }
}
