/*
  Warnings:

  - The `status` column on the `Subscription` table would be dropped and recreated. This will lead to data loss if there is data in the column.
  - You are about to drop the column `paymentMethod` on the `Transaction` table. All the data in the column will be lost.
  - You are about to drop the column `currentSubscription` on the `User` table. All the data in the column will be lost.
  - You are about to drop the `user_sessions` table. If the table is not empty, all the data it contains will be lost.
  - Changed the type of `type` on the `Transaction` table. No cast exists, the column would be dropped and recreated, which cannot be done if there is data, since the column is required.

*/
-- AlterTable
ALTER TABLE "Subscription" DROP COLUMN "status",
ADD COLUMN     "status" TEXT NOT NULL DEFAULT 'active';

-- AlterTable
ALTER TABLE "Transaction" DROP COLUMN "paymentMethod",
DROP COLUMN "type",
ADD COLUMN     "type" TEXT NOT NULL;

-- AlterTable
ALTER TABLE "User" DROP COLUMN "currentSubscription";

-- DropTable
DROP TABLE "user_sessions";

-- DropEnum
DROP TYPE "SubscriptionPlan";

-- DropEnum
DROP TYPE "SubscriptionStatus";

-- DropEnum
DROP TYPE "TransactionPaymentMethod";

-- DropEnum
DROP TYPE "TransactionType";
