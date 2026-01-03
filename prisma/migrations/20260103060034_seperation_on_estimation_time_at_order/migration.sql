/*
  Warnings:

  - You are about to drop the column `estimatedTime` on the `Order` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "Order" DROP COLUMN "estimatedTime",
ADD COLUMN     "estimatedTime_Machine" INTEGER,
ADD COLUMN     "estimatedTime_Operator" INTEGER;
