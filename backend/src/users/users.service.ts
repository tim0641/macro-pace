import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { UpdateProfileDto } from './dto/update-profile.dto';
import { computeTargets, type ProfileForTargets, type TargetsResult } from './targets.util';

@Injectable()
export class UsersService {
  constructor(private prisma: PrismaService) {}

  async getProfile(userId: string) {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      select: {
        id: true,
        email: true,
        createdAt: true,
        profile: true,
      },
    });

    if (!user) {
      throw new Error('Utilisateur non trouvé');
    }

    return user;
  }

  async updateProfile(userId: string, dto: UpdateProfileDto) {
    const data: any = {};
    if (dto.sex !== undefined) data.sex = dto.sex;
    if (dto.birthdate !== undefined) data.birthdate = dto.birthdate ? new Date(dto.birthdate) : null;
    if (dto.heightCm !== undefined) data.heightCm = dto.heightCm;
    if (dto.weightKg !== undefined) data.weightKg = dto.weightKg;
    if (dto.activityLevel !== undefined) data.activityLevel = dto.activityLevel;
    if (dto.goal !== undefined) data.goal = dto.goal;
    if (dto.goalRate !== undefined) data.goalRate = dto.goalRate;

    const profile = await this.prisma.profile.upsert({
      where: { userId },
      create: {
        userId,
        ...data,
      },
      update: data,
    });

    return profile;
  }

  async getTargets(userId: string): Promise<TargetsResult | null> {
    const profile = await this.prisma.profile.findUnique({
      where: { userId },
    });

    if (!profile) return null;

    const forTargets: ProfileForTargets = {
      sex: profile.sex,
      birthdate: profile.birthdate,
      weightKg: profile.weightKg != null ? Number(profile.weightKg) : null,
      heightCm: profile.heightCm != null ? Number(profile.heightCm) : null,
      activityLevel: profile.activityLevel,
      goal: profile.goal,
      goalRate: profile.goalRate,
    };

    return computeTargets(forTargets);
  }
}
