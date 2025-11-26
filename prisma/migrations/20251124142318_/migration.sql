/*
  Warnings:

  - A unique constraint covering the columns `[date]` on the table `DailyPrintSummary` will be added. If there are existing duplicate values, this will fail.

*/
-- AlterTable
ALTER TABLE "DailyPrintSummary" ALTER COLUMN "date" SET DATA TYPE DATE;

-- CreateIndex
CREATE UNIQUE INDEX "DailyPrintSummary_date_key" ON "DailyPrintSummary"("date");
