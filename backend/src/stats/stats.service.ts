import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class StatsService {
  constructor(private prisma: PrismaService) {}

  async getDayStats(userId: string, date: string) {
    const startOfDay = new Date(date);
    startOfDay.setHours(0, 0, 0, 0);
    const endOfDay = new Date(date);
    endOfDay.setHours(23, 59, 59, 999);

    // Récupérer les repas et leurs items
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
    });

    // Calculer les totaux nutritionnels
    const nutritionTotals = meals.reduce(
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

    // Récupérer les entraînements
    const workouts = await this.prisma.workout.findMany({
      where: {
        userId,
        startedAt: {
          gte: startOfDay,
          lte: endOfDay,
        },
      },
      include: {
        runDetails: true,
      },
    });

    // Calculer la durée totale d'entraînement
    const totalDurationMin = workouts.reduce((acc, w) => acc + w.durationMin, 0);

    // Récupérer le poids de l'utilisateur
    const profile = await this.prisma.profile.findUnique({
      where: { userId },
    });

    const weightKg = profile?.weightKg ? Number(profile.weightKg) : 70; // Défaut 70kg

    // Calculer les calories brûlées estimées
    let totalBurnKcal = 0;
    for (const workout of workouts) {
      if (workout.type === 'run' && workout.runDetails) {
        // Formule: 1.0 * weightKg * distanceKm
        totalBurnKcal += 1.0 * weightKg * Number(workout.runDetails.distanceKm);
      } else if (workout.type === 'strength') {
        // Formule: 6 * weightKg * (durationMin/60) (MET approximatif)
        totalBurnKcal += 6 * weightKg * (workout.durationMin / 60);
      }
    }

    return {
      date,
      nutrition: nutritionTotals,
      workouts: {
        count: workouts.length,
        totalDurationMin,
        totalBurnKcal: Math.round(totalBurnKcal),
      },
    };
  }
}
