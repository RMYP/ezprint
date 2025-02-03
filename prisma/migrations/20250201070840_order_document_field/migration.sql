/*
  Warnings:

  - Added the required column `documentPath` to the `Order` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "Order" ADD COLUMN     "documentPath" TEXT NOT NULL,
ALTER COLUMN "sheetCount" DROP NOT NULL,
ALTER COLUMN "paperType" DROP NOT NULL,
ALTER COLUMN "finishing" DROP NOT NULL,
ALTER COLUMN "quantity" DROP NOT NULL,
ALTER COLUMN "printType" DROP NOT NULL,
ALTER COLUMN "totalPrice" DROP NOT NULL,
ALTER COLUMN "status" DROP NOT NULL,
ALTER COLUMN "paymentStatus" DROP NOT NULL;
