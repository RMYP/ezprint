/*
  Warnings:

  - The `status` column on the `Order` table would be dropped and recreated. This will lead to data loss if there is data in the column.
  - Added the required column `documentName` to the `Order` table without a default value. This is not possible if the table is not empty.
  - Added the required column `bank` to the `Payment` table without a default value. This is not possible if the table is not empty.
  - Added the required column `vaNumber` to the `Payment` table without a default value. This is not possible if the table is not empty.

*/
-- CreateEnum
CREATE TYPE "OrderProgress" AS ENUM ('confirm', 'onProgress', 'deny', 'finished');

-- AlterTable
ALTER TABLE "Order" ADD COLUMN     "documentName" TEXT NOT NULL,
DROP COLUMN "status",
ADD COLUMN     "status" "OrderProgress";

-- AlterTable
ALTER TABLE "Payment" ADD COLUMN     "bank" TEXT NOT NULL,
ADD COLUMN     "vaNumber" TEXT NOT NULL;
