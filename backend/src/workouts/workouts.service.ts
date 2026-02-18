import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateWorkoutDto } from './dto/create-workout.dto';
import { GetWorkoutsDto } from './dto/get-workouts.dto';

@Injectable()
export class WorkoutsService {
  constructor(private prisma: PrismaService) {}

  async create(userId: string, createDto: CreateWorkoutDto) {
    const workoutData: any = {
      userId,
      startedAt: new Date(createDto.startedAt),
      type: createDto.type,
      durationMin: createDto.durationMin,
      rpe: createDto.rpe,
      notes: createDto.notes,
    };

    const workout = await this.prisma.workout.create({
      data: workoutData,
    });

    // Si c'est un run, créer les détails
    if (createDto.type === 'run' && createDto.distanceKm && createDto.avgPaceSecKm) {
      await this.prisma.runDetails.create({
        data: {
          workoutId: workout.id,
          distanceKm: createDto.distanceKm,
          avgPaceSecKm: createDto.avgPaceSecKm,
        },
      });
    }

    return this.prisma.workout.findUnique({
      where: { id: workout.id },
      include: {
        runDetails: true,
      },
    });
  }

  async findByDateRange(userId: string, getDto: GetWorkoutsDto) {
    const where: any = {
      userId,
    };

    if (getDto.from || getDto.to) {
      where.startedAt = {};
      if (getDto.from) {
        where.startedAt.gte = new Date(getDto.from);
      }
      if (getDto.to) {
        const endDate = new Date(getDto.to);
        endDate.setHours(23, 59, 59, 999);
        where.startedAt.lte = endDate;
      }
    }

    const workouts = await this.prisma.workout.findMany({
      where,
      include: {
        runDetails: true,
      },
      orderBy: {
        startedAt: 'desc',
      },
    });

    return workouts;
  }
}
