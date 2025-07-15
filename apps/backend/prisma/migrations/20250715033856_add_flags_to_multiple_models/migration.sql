/*
  Warnings:

  - You are about to drop the column `addedBy` on the `Client` table. All the data in the column will be lost.
  - You are about to drop the column `status` on the `Subscription` table. All the data in the column will be lost.
  - A unique constraint covering the columns `[email,projectId,userId]` on the table `Client` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `userId` to the `Client` table without a default value. This is not possible if the table is not empty.
  - Added the required column `updatedAt` to the `File` table without a default value. This is not possible if the table is not empty.

*/
-- DropForeignKey
ALTER TABLE "Client" DROP CONSTRAINT "Client_addedBy_fkey";

-- DropIndex
DROP INDEX "Client_email_projectId_addedBy_key";

-- AlterTable
ALTER TABLE "Client" DROP COLUMN "addedBy",
ADD COLUMN     "isBlocked" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "projectPermissions" JSONB,
ADD COLUMN     "userId" TEXT NOT NULL;

-- AlterTable
ALTER TABLE "File" ADD COLUMN     "updatedAt" TIMESTAMP(3) NOT NULL;

-- AlterTable
ALTER TABLE "Subscription" DROP COLUMN "status",
ADD COLUMN     "isActive" BOOLEAN NOT NULL DEFAULT true;

-- AlterTable
ALTER TABLE "User" ADD COLUMN     "gracePeriodExpiresAt" TIMESTAMP(3),
ADD COLUMN     "hasExceededStorageLimit" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "isActive" BOOLEAN NOT NULL DEFAULT true,
ADD COLUMN     "isAdmin" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "isFounderMember" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "isInGracePeriod" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "isVerified" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "storageLimit" INTEGER NOT NULL DEFAULT 5369,
ADD COLUMN     "storageUsed" INTEGER NOT NULL DEFAULT 0;

-- CreateIndex
CREATE UNIQUE INDEX "Client_email_projectId_userId_key" ON "Client"("email", "projectId", "userId");

-- AddForeignKey
ALTER TABLE "Client" ADD CONSTRAINT "Client_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
