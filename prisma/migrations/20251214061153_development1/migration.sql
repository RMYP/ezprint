/*
  Warnings:

  - Added the required column `inkType` to the `Order` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "Order" DROP COLUMN "inkType",
ADD COLUMN     "inkType" TEXT NOT NULL;

-- DropEnum
DROP TYPE "InkType";

-- CreateTable
CREATE TABLE "PaperGsmPrice" (
    "id" TEXT NOT NULL,
    "gsm" TEXT NOT NULL,
    "price" INTEGER NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updateAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- CreateTable
CREATE TABLE "FinishingOption" (
    "id" TEXT NOT NULL,
    "finishingType" TEXT NOT NULL,
    "price" INTEGER NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updateAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- CreateTable
CREATE TABLE "PrintingType" (
    "id" TEXT NOT NULL,
    "printingType" TEXT NOT NULL,
    "price" INTEGER NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updateAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- CreateTable
CREATE TABLE "InkType" (
    "id" TEXT NOT NULL,
    "InkType" TEXT NOT NULL,
    "price" INTEGER NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updateAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- CreateTable
CREATE TABLE "PrintSpesification" (
    "id" TEXT NOT NULL,
    "inkTypeId" TEXT NOT NULL,
    "printingTypeId" TEXT NOT NULL,
    "finishingOptionId" TEXT NOT NULL,
    "paperGsmPriceId" TEXT NOT NULL
);

-- CreateIndex
CREATE UNIQUE INDEX "PaperGsmPrice_id_key" ON "PaperGsmPrice"("id");

-- CreateIndex
CREATE UNIQUE INDEX "FinishingOption_id_key" ON "FinishingOption"("id");

-- CreateIndex
CREATE UNIQUE INDEX "PrintingType_id_key" ON "PrintingType"("id");

-- CreateIndex
CREATE UNIQUE INDEX "InkType_id_key" ON "InkType"("id");

-- CreateIndex
CREATE UNIQUE INDEX "PrintSpesification_id_key" ON "PrintSpesification"("id");

-- AddForeignKey
ALTER TABLE "PrintSpesification" ADD CONSTRAINT "PrintSpesification_inkTypeId_fkey" FOREIGN KEY ("inkTypeId") REFERENCES "InkType"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PrintSpesification" ADD CONSTRAINT "PrintSpesification_printingTypeId_fkey" FOREIGN KEY ("printingTypeId") REFERENCES "PrintingType"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PrintSpesification" ADD CONSTRAINT "PrintSpesification_finishingOptionId_fkey" FOREIGN KEY ("finishingOptionId") REFERENCES "FinishingOption"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PrintSpesification" ADD CONSTRAINT "PrintSpesification_paperGsmPriceId_fkey" FOREIGN KEY ("paperGsmPriceId") REFERENCES "PaperGsmPrice"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
