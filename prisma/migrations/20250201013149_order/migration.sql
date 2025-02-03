-- CreateTable
CREATE TABLE "Order" (
    "id" TEXT NOT NULL,
    "sheetCount" INTEGER NOT NULL,
    "paperType" TEXT NOT NULL,
    "finishing" TEXT NOT NULL,
    "quantity" INTEGER NOT NULL,
    "printType" TEXT NOT NULL,
    "totalPrice" INTEGER NOT NULL,
    "status" BOOLEAN NOT NULL,
    "paymentStatus" BOOLEAN NOT NULL,
    "userId" TEXT NOT NULL
);

-- CreateIndex
CREATE UNIQUE INDEX "Order_id_key" ON "Order"("id");

-- CreateIndex
CREATE UNIQUE INDEX "Order_userId_key" ON "Order"("userId");

-- AddForeignKey
ALTER TABLE "Order" ADD CONSTRAINT "Order_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
