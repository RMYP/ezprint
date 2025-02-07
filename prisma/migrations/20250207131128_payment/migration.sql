-- CreateEnum
CREATE TYPE "TransactionStatus" AS ENUM ('PENDING', 'CAPTURE', 'SETTLEMENT', 'DENY', 'CANCEL', 'EXPIRE');

-- CreateTable
CREATE TABLE "Payment" (
    "id" TEXT NOT NULL,
    "transactionId" TEXT NOT NULL,
    "orderId" TEXT NOT NULL,
    "grossAmount" TEXT NOT NULL,
    "paymentType" TEXT NOT NULL,
    "transactionTime" TIMESTAMP(3) NOT NULL,
    "expiryTime" TIMESTAMP(3) NOT NULL,
    "transactionStatus" "TransactionStatus" NOT NULL
);

-- CreateIndex
CREATE UNIQUE INDEX "Payment_id_key" ON "Payment"("id");

-- AddForeignKey
ALTER TABLE "Payment" ADD CONSTRAINT "Payment_orderId_fkey" FOREIGN KEY ("orderId") REFERENCES "Order"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
