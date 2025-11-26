-- CreateEnum
CREATE TYPE "InkType" AS ENUM ('blackWhite', 'colors');

-- AlterTable
ALTER TABLE "Order" ADD COLUMN     "inkType" "InkType",
ALTER COLUMN "orderDate" SET DEFAULT CURRENT_TIMESTAMP;

-- CreateTable
CREATE TABLE "DailyPrintSummary" (
    "id" TEXT NOT NULL,
    "date" TIMESTAMP(3) NOT NULL,
    "totalSheets" INTEGER NOT NULL DEFAULT 0,
    "isWeekend" INTEGER NOT NULL DEFAULT 0,
    "isHoliday" INTEGER NOT NULL DEFAULT 0,
    "isPeakAcademic" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- CreateIndex
CREATE UNIQUE INDEX "DailyPrintSummary_id_key" ON "DailyPrintSummary"("id");
