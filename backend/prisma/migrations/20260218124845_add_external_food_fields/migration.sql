/*
  Warnings:

  - You are about to drop the column `foodId` on the `meal_items` table. All the data in the column will be lost.
  - You are about to drop the `foods` table. If the table is not empty, all the data it contains will be lost.
  - Added the required column `carbs100g` to the `meal_items` table without a default value. This is not possible if the table is not empty.
  - Added the required column `fat100g` to the `meal_items` table without a default value. This is not possible if the table is not empty.
  - Added the required column `foodName` to the `meal_items` table without a default value. This is not possible if the table is not empty.
  - Added the required column `foodSource` to the `meal_items` table without a default value. This is not possible if the table is not empty.
  - Added the required column `kcal100g` to the `meal_items` table without a default value. This is not possible if the table is not empty.
  - Added the required column `protein100g` to the `meal_items` table without a default value. This is not possible if the table is not empty.

*/
-- CreateEnum
CREATE TYPE "FoodSource" AS ENUM ('usda', 'custom');

-- DropForeignKey
ALTER TABLE "meal_items" DROP CONSTRAINT "meal_items_foodId_fkey";

-- AlterTable
ALTER TABLE "meal_items" DROP COLUMN "foodId",
ADD COLUMN     "carbs100g" DOUBLE PRECISION NOT NULL,
ADD COLUMN     "externalFoodId" TEXT,
ADD COLUMN     "fat100g" DOUBLE PRECISION NOT NULL,
ADD COLUMN     "foodBrand" TEXT,
ADD COLUMN     "foodName" TEXT NOT NULL,
ADD COLUMN     "foodSource" "FoodSource" NOT NULL,
ADD COLUMN     "kcal100g" DOUBLE PRECISION NOT NULL,
ADD COLUMN     "protein100g" DOUBLE PRECISION NOT NULL;

-- DropTable
DROP TABLE "foods";

-- CreateIndex
CREATE INDEX "meal_items_externalFoodId_idx" ON "meal_items"("externalFoodId");
