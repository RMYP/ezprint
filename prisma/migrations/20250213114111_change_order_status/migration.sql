/*
  Warnings:

  - The values [confirm] on the enum `OrderProgress` will be removed. If these variants are still used in the database, this will fail.

*/
-- AlterEnum
BEGIN;
CREATE TYPE "OrderProgress_new" AS ENUM ('waitingCheckout', 'waitingPayment', 'confirmOrder', 'onProgress', 'deny', 'finished');
ALTER TABLE "Order" ALTER COLUMN "status" TYPE "OrderProgress_new" USING ("status"::text::"OrderProgress_new");
ALTER TYPE "OrderProgress" RENAME TO "OrderProgress_old";
ALTER TYPE "OrderProgress_new" RENAME TO "OrderProgress";
DROP TYPE "OrderProgress_old";
COMMIT;
