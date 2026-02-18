-- CreateEnum
CREATE TYPE "Sex" AS ENUM ('male', 'female');

-- CreateEnum
CREATE TYPE "ActivityLevel" AS ENUM ('sedentary', 'light', 'moderate', 'very', 'athlete');

-- CreateEnum
CREATE TYPE "Goal" AS ENUM ('maintain', 'lose', 'gain');

-- CreateEnum
CREATE TYPE "GoalRate" AS ENUM ('slow', 'medium', 'fast');

-- AlterTable
ALTER TABLE "profiles" ADD COLUMN     "activityLevel" "ActivityLevel",
ADD COLUMN     "birthdate" DATE,
ADD COLUMN     "goal" "Goal",
ADD COLUMN     "goalRate" "GoalRate",
ADD COLUMN     "heightCm" DOUBLE PRECISION,
ADD COLUMN     "sex" "Sex";
