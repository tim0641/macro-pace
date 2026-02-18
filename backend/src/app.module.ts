import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { PassportModule } from '@nestjs/passport';
import { PrismaService } from './prisma/prisma.service';
import { AuthModule } from './auth/auth.module';
import { UsersModule } from './users/users.module';
import { FoodsModule } from './foods/foods.module';
import { MealsModule } from './meals/meals.module';
import { WorkoutsModule } from './workouts/workouts.module';
import { StatsModule } from './stats/stats.module';

@Module({
  imports: [
    PassportModule,
    JwtModule.register({
      secret: process.env.JWT_SECRET || 'default-secret',
      signOptions: { expiresIn: process.env.JWT_EXPIRES_IN || '15m' },
    }),
    AuthModule,
    UsersModule,
    FoodsModule,
    MealsModule,
    WorkoutsModule,
    StatsModule,
  ],
  providers: [PrismaService],
  exports: [PrismaService],
})
export class AppModule {}
