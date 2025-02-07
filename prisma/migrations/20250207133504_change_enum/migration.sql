/*
  Warnings:

  - The values [PENDING,CAPTURE,SETTLEMENT,DENY,CANCEL,EXPIRE] on the enum `TransactionStatus` will be removed. If these variants are still used in the database, this will fail.

*/
-- AlterEnum
BEGIN;
CREATE TYPE "TransactionStatus_new" AS ENUM ('pending', 'capture', 'settlement', 'deny', 'cancel', 'expire');
ALTER TABLE "Payment" ALTER COLUMN "transactionStatus" TYPE "TransactionStatus_new" USING ("transactionStatus"::text::"TransactionStatus_new");
ALTER TYPE "TransactionStatus" RENAME TO "TransactionStatus_old";
ALTER TYPE "TransactionStatus_new" RENAME TO "TransactionStatus";
DROP TYPE "TransactionStatus_old";
COMMIT;
