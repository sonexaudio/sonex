-- CreateEnum
CREATE TYPE "SubscriptionStatus" AS ENUM ('subscribed', 'past_due', 'free', 'cancelled', 'incomplete');

-- AlterTable
ALTER TABLE "User" ADD COLUMN     "subscriptionStatus" "SubscriptionStatus" NOT NULL DEFAULT 'free';
