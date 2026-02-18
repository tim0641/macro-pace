/*
  Warnings:

  - The values [usda] on the enum `FoodSource` will be removed. If these variants are still used in the database, this will fail.

*/
-- AlterEnum
BEGIN;
CREATE TYPE "FoodSource_new" AS ENUM ('ciqual', 'custom');
ALTER TABLE "meal_items" ALTER COLUMN "foodSource" TYPE "FoodSource_new" USING ("foodSource"::text::"FoodSource_new");
ALTER TYPE "FoodSource" RENAME TO "FoodSource_old";
ALTER TYPE "FoodSource_new" RENAME TO "FoodSource";
DROP TYPE "FoodSource_old";
COMMIT;
