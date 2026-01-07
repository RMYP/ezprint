/*
  Warnings:

  - You are about to drop the column `date` on the `DailyPrintSummary` table. All the data in the column will be lost.
  - You are about to drop the column `isHoliday` on the `DailyPrintSummary` table. All the data in the column will be lost.
  - You are about to drop the column `isPeakAcademic` on the `DailyPrintSummary` table. All the data in the column will be lost.
  - You are about to drop the column `isWeekend` on the `DailyPrintSummary` table. All the data in the column will be lost.
  - You are about to drop the column `totalSheets` on the `DailyPrintSummary` table. All the data in the column will be lost.
  - Added the required column `lastBinderFinishTime` to the `DailyPrintSummary` table without a default value. This is not possible if the table is not empty.
  - Added the required column `lastPrinterFinishTime` to the `DailyPrintSummary` table without a default value. This is not possible if the table is not empty.

*/
-- DropIndex
DROP INDEX "DailyPrintSummary_date_key";

-- AlterTable
ALTER TABLE "DailyPrintSummary" DROP COLUMN "date",
DROP COLUMN "isHoliday",
DROP COLUMN "isPeakAcademic",
DROP COLUMN "isWeekend",
DROP COLUMN "totalSheets",
ADD COLUMN     "lastBinderFinishTime" TIMESTAMP(3) NOT NULL,
ADD COLUMN     "lastPrinterFinishTime" TIMESTAMP(3) NOT NULL;
