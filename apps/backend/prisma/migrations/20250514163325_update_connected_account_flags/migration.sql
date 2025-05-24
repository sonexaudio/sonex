/*
  Warnings:

  - You are about to drop the column `stripeAccountId` on the `User` table. All the data in the column will be lost.
  - A unique constraint covering the columns `[connectedAccountId]` on the table `User` will be added. If there are existing duplicate values, this will fail.

*/
-- DropIndex
DROP INDEX "User_stripeAccountId_key";

-- AlterTable
ALTER TABLE "User" DROP COLUMN "stripeAccountId",
ADD COLUMN     "connectedAccountId" TEXT,
ADD COLUMN     "isOnboarded" BOOLEAN NOT NULL DEFAULT false;

-- CreateIndex
CREATE UNIQUE INDEX "User_connectedAccountId_key" ON "User"("connectedAccountId");
