-- AlterTable
ALTER TABLE "Transaction" ADD COLUMN     "refundReason" TEXT,
ADD COLUMN     "refundedAt" TIMESTAMP(3);
